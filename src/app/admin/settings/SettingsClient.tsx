"use client";

import { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Settings as SettingsIcon, X } from "lucide-react";

interface SettingsClientProps {
  initialSettings: Record<string, unknown>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [formData, setFormData] = useState({
    currency: String(initialSettings.currency || "VND"),
    language: String(initialSettings.language || "Vietnamese"),
    address: String(initialSettings.address || "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng"),
    state: String(initialSettings.state || "Đà Nẵng"),
    emailNotification: Boolean(initialSettings.emailNotification ?? true),
    smsNotification: Boolean(initialSettings.smsNotification ?? true),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Đã lưu cài đặt CRM trực tiếp vào CSDL MongoDB!" });
      } else {
        setMessage({ type: "error", text: data.message || "Lưu cài đặt thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-xs font-medium border shadow-lg ${
            message.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/80 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-blue-400" />
            <span>Cấu Hình CRM (MongoDB Database Settings)</span>
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
    </div>
  );
}
