"use client";

import { useState } from "react";
import { AlertTriangle, KeyRound, Pencil, Plus, Trash2, X, UserCog } from "lucide-react";
import type { AdminUser } from "@/types";
import { USER_ROLE } from "@/lib/crm-labels";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface UsersClientProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

const emptyForm = { name: "", email: "", password: "", role: "sales" as AdminUser["role"] };

export default function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "sales" as AdminUser["role"] });

  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    notify(null);
    try {
      const res = await adminFetch("/api/admin/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await readJson(res);
      if (data.success) {
        setUsers((prev) => [...prev, data.data]);
        setIsAddOpen(false);
        setAddForm(emptyForm);
        notify({ type: "success", text: data.message || "Đã tạo tài khoản." });
      } else {
        notify({ type: "error", text: data.message || "Tạo tài khoản thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    notify(null);
    try {
      const res = await adminFetch(`/api/admin/users/${editing._id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await readJson(res);
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u._id === editing._id ? data.data : u)));
        setEditing(null);
        notify({ type: "success", text: data.message || "Đã cập nhật tài khoản." });
      } else {
        notify({ type: "error", text: data.message || "Cập nhật thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetting) return;
    setLoading(true);
    notify(null);
    try {
      const res = await adminFetch(`/api/admin/users/${resetting._id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await readJson(res);
      if (data.success) {
        setResetting(null);
        setNewPassword("");
        notify({ type: "success", text: `Đã đặt lại mật khẩu cho ${resetting.email}.` });
      } else {
        notify({ type: "error", text: data.message || "Đặt lại mật khẩu thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    notify(null);
    try {
      const res = await adminFetch(`/api/admin/users/${deleting._id}/`, { method: "DELETE" });
      const data = await readJson(res);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleting._id));
        setDeleting(null);
        notify({ type: "success", text: data.message || "Đã xoá tài khoản." });
      } else {
        notify({ type: "error", text: data.message || "Xoá thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <UserCog className="h-6 w-6 text-blue-400" />
            <span>Người dùng hệ thống</span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {users.length} tài khoản · {users.filter((u) => u.role === "admin").length} quản trị viên
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm tài khoản</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Họ tên</th>
              <th className="px-4 py-3.5">Email đăng nhập</th>
              <th className="px-4 py-3.5">Vai trò</th>
              <th className="px-4 py-3.5">Ngày tạo</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {users.map((u) => (
              <tr key={String(u._id)} className="transition-colors hover:bg-slate-800/50">
                <td className="px-4 py-3.5 font-semibold text-white">
                  {u.name}
                  {String(u._id) === currentUserId && (
                    <span className="ml-2 rounded bg-blue-950 px-1.5 py-0.5 text-[10px] text-blue-300">
                      Bạn
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-400">{u.email}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      u.role === "admin"
                        ? "border border-purple-800/50 bg-purple-950 text-purple-300"
                        : "border border-blue-800/50 bg-blue-950 text-blue-300"
                    }`}
                  >
                    {USER_ROLE[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setEditing(u);
                        setEditForm({ name: u.name, email: u.email, role: u.role });
                      }}
                      title="Sửa thông tin"
                      className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setResetting(u);
                        setNewPassword("");
                      }}
                      title="Đặt lại mật khẩu"
                      className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-amber-600 hover:text-white"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      disabled={String(u._id) === currentUserId}
                      title={
                        String(u._id) === currentUserId
                          ? "Không thể xoá chính mình"
                          : "Xoá tài khoản"
                      }
                      className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:text-slate-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thêm tài khoản */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAdd}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Thêm tài khoản</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="u-name" className="mb-1.5 block font-semibold text-slate-300">
                  Họ tên
                </label>
                <input
                  id="u-name"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="u-email" className="mb-1.5 block font-semibold text-slate-300">
                  Email đăng nhập
                </label>
                <input
                  id="u-email"
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="u-pass" className="mb-1.5 block font-semibold text-slate-300">
                  Mật khẩu (tối thiểu 8 ký tự)
                </label>
                <input
                  id="u-pass"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="u-role" className="mb-1.5 block font-semibold text-slate-300">
                  Vai trò
                </label>
                <select
                  id="u-role"
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as AdminUser["role"] })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="sales">Nhân viên kinh doanh</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50"
              >
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sửa tài khoản */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEdit}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Sửa tài khoản</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="e-name" className="mb-1.5 block font-semibold text-slate-300">
                  Họ tên
                </label>
                <input
                  id="e-name"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="e-email" className="mb-1.5 block font-semibold text-slate-300">
                  Email đăng nhập
                </label>
                <input
                  id="e-email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="e-role" className="mb-1.5 block font-semibold text-slate-300">
                  Vai trò
                </label>
                <select
                  id="e-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AdminUser["role"] })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="sales">Nhân viên kinh doanh</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Đặt lại mật khẩu */}
      {resetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleResetPassword}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-white">Đặt lại mật khẩu</h2>
            <p className="text-xs text-slate-400">
              Tài khoản <strong className="text-slate-200">{resetting.email}</strong> sẽ dùng mật khẩu mới
              ngay lập tức.
            </p>

            <div>
              <label htmlFor="r-pass" className="mb-1.5 block text-xs font-semibold text-slate-300">
                Mật khẩu mới (tối thiểu 8 ký tự)
              </label>
              <input
                id="r-pass"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetting(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 disabled:opacity-50"
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Xoá */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <span>Xoá tài khoản?</span>
            </h2>
            <p className="text-xs text-slate-400">
              Tài khoản <strong className="text-slate-200">{deleting.email}</strong> sẽ mất quyền truy cập
              vào CRM. Thao tác không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
