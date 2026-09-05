"use client";

import { useState } from "react";
import { Save, KeyRound, Settings as SettingsIcon, UserCircle } from "lucide-react";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface SettingsClientProps {
  initialSettings: Record<string, unknown>;
  currentUser: { name: string; email: string; role: string };
}

export default function SettingsClient({ initialSettings, currentUser }: SettingsClientProps) {
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    currency: String(initialSettings.currency || "VND"),
    language: String(initialSettings.language || "Tiếng Việt"),
    address: String(initialSettings.address || "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng"),
    state: String(initialSettings.state || "Đà Nẵng"),
    emailNotification: Boolean(initialSettings.emailNotification ?? true),
    smsNotification: Boolean(initialSettings.smsNotification ?? true),
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/settings/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success) {
        notify({ type: "success", text: "Đã lưu cài đặt CRM trực tiếp vào CSDL MongoDB!" });
      } else {
        notify({ type: "error", text: data.message || "Lưu cài đặt thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/auth/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await readJson(res);
      notify({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "Đã cập nhật hồ sơ." : "Cập nhật hồ sơ thất bại."),
      });
      // Tên hiển thị nằm trong session token nên cần tải lại trang để sidebar đổi theo.
      if (data.success) setTimeout(() => window.location.reload(), 900);
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify({ type: "error", text: "Xác nhận mật khẩu không khớp." });
      return;
    }

    setPasswordLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/auth/password/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await readJson(res);
      notify({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "Đã đổi mật khẩu." : "Đổi mật khẩu thất bại."),
      });
      if (data.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-blue-400" />
            <span>Cài đặt hệ thống</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Thay đổi thiết lập chung của hệ thống đại lý VinFast Đà Nẵng
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Thông Tin Showroom Đại Lý</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Đơn Vị Tiền Tệ</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ngôn Ngữ Hệ Thống</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Địa Chỉ Showroom Main</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tỉnh / Thành Phố</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Cấu Hình Thông Báo Lead</h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotification}
                onChange={(e) => setFormData((prev) => ({ ...prev, emailNotification: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>Gửi thông báo Email khi có lead lái thử mới từ website</span>
            </label>

            <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.smsNotification}
                onChange={(e) => setFormData((prev) => ({ ...prev, smsNotification: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>Gửi tin nhắn SMS cảnh báo khi giá đấu giá thay đổi</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Đang lưu..." : "LƯU CẤU HÌNH MONGO"}</span>
          </button>
        </div>
      </form>

      {/* Tài khoản cá nhân */}
      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm"
      >
        <h3 className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
          <UserCircle className="h-4 w-4 text-blue-400" />
          <span>Tài khoản của tôi</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="mb-1 block font-semibold text-slate-300">
              Họ tên hiển thị
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1 block font-semibold text-slate-300">
              Email đăng nhập
            </label>
            <input
              id="profile-email"
              type="email"
              required
              autoComplete="username"
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Vai trò hiện tại:{" "}
          <strong className="text-slate-300">
            {currentUser.role === "admin" ? "Quản trị viên" : "Nhân viên kinh doanh"}
          </strong>{" "}
          — chỉ quản trị viên mới thay đổi được vai trò, tại mục Người dùng.
        </p>

        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            type="submit"
            disabled={profileLoading}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{profileLoading ? "Đang lưu..." : "Lưu hồ sơ"}</span>
          </button>
        </div>
      </form>

      {/* Đổi mật khẩu */}
      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm"
      >
        <h3 className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
          <KeyRound className="h-4 w-4 text-amber-400" />
          <span>Đổi mật khẩu</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
          <div>
            <label htmlFor="pass-current" className="mb-1 block font-semibold text-slate-300">
              Mật khẩu hiện tại
            </label>
            <input
              id="pass-current"
              type="password"
              required
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="pass-new" className="mb-1 block font-semibold text-slate-300">
              Mật khẩu mới
            </label>
            <input
              id="pass-new"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="pass-confirm" className="mb-1 block font-semibold text-slate-300">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="pass-confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">Mật khẩu mới phải từ 8 ký tự trở lên.</p>

        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            type="submit"
            disabled={passwordLoading}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 transition-all hover:bg-amber-500 disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            <span>{passwordLoading ? "Đang xử lý..." : "Đổi mật khẩu"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
