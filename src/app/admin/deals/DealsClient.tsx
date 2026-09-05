"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Download, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { IDeal } from "@/lib/models/Deal";

interface DealsClientProps {
  initialDeals: IDeal[];
}

export default function DealsClient({ initialDeals }: DealsClientProps) {
  const [deals, setDeals] = useState<IDeal[]>(initialDeals);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<IDeal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<IDeal | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    dealId: "#DEAL-1001",
    ownerName: "",
    creationDate: "05/09/2026",
    carType: "VinFast VF 8",
    returnDate: "15/09/2026",
    paymentType: "Transfer",
    totalPrice: 999000000,
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setDeals((prev) => [data.data, ...prev]);
        setIsAddOpen(false);
        setMessage({ type: "success", text: `Đã tạo hợp đồng mới cho ${data.data.ownerName}!` });
      } else {
        setMessage({ type: "error", text: data.message || "Tạo hợp đồng thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/deals/${editingDeal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setDeals((prev) => prev.map((d) => (d._id === editingDeal._id ? { ...d, ...data.data } : d)));
        setEditingDeal(null);
        setMessage({ type: "success", text: "Đã cập nhật hợp đồng thành công!" });
      } else {
        setMessage({ type: "error", text: data.message || "Cập nhật thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDeal) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/deals/${deletingDeal._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setDeals((prev) => prev.filter((d) => d._id !== deletingDeal._id));
        setMessage({ type: "success", text: `Đã xóa hợp đồng ${deletingDeal.dealId} khỏi MongoDB.` });
        setDeletingDeal(null);
      } else {
        setMessage({ type: "error", text: data.message || "Xóa thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deals (Quản Lý Hợp Đồng MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-emerald-400 font-semibold">{deals.length} hợp đồng</strong> truy vấn trực tiếp từ CSDL database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({
                dealId: `#DEAL-${Math.floor(1000 + Math.random() * 9000)}`,
                ownerName: "",
                creationDate: new Date().toLocaleDateString("en-US"),
                carType: "VinFast VF 8",
                returnDate: "15/09/2026",
                paymentType: "Transfer",
                totalPrice: 999000000,
              });
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tạo Hợp Đồng Mới</span>
          </button>

          <a
            href="/api/admin/deals"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Deals API</span>
          </a>
        </div>
      </div>

      {/* Real Deals List Table from MongoDB */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
          <span>Danh Sách Hợp Đồng ({deals.length} Hợp đồng)</span>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Mã Hợp Đồng</th>
              <th className="px-5 py-3.5">Chủ Sở Hữu / Khách</th>
              <th className="px-5 py-3.5">Ngày Tạo</th>
              <th className="px-5 py-3.5">Loại Xe VinFast</th>
              <th className="px-5 py-3.5">Thanh Toán</th>
              <th className="px-5 py-3.5 text-right">Tổng Giá Trị</th>
              <th className="px-5 py-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {deals.map((deal) => (
              <tr key={deal.dealId || String(deal._id)} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-mono text-slate-500">{deal.dealId}</td>
                <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>{deal.ownerName}</span>
                </td>
                <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{deal.creationDate}</td>
                <td className="px-5 py-4 font-medium text-blue-300">{deal.carType}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      deal.paymentType === "Card"
                        ? "bg-purple-950 text-purple-300 border border-purple-800/40"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                    }`}
                  >
                    {deal.paymentType}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold text-emerald-400 text-sm">
                  {deal.totalPrice ? `${deal.totalPrice.toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingDeal(deal);
                        setFormData({
                          dealId: deal.dealId || "",
                          ownerName: deal.ownerName || "",
                          creationDate: deal.creationDate || "",
                          carType: deal.carType || "",
                          returnDate: deal.returnDate || "",
                          paymentType: deal.paymentType || "Transfer",
                          totalPrice: deal.totalPrice || 0,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDeal(deal)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all"
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

      {/* Modal Add Deal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Tạo Hợp Đồng Mới</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Họ Tên Khách Hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.ownerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dòng Xe VinFast</label>
                <input
                  type="text"
                  required
                  placeholder="VinFast VF 8 All New"
                  value={formData.carType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, carType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tổng Giá Trị (VND)</label>
                  <input
                    type="number"
                    required
                    value={formData.totalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalPrice: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hình Thức Thanh Toán</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Transfer">Chuyển Khoản (Transfer)</option>
                    <option value="Card">Thẻ Quốc Tế (Card)</option>
                    <option value="Cash">Tiền Mặt (Cash)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Tạo Hợp Đồng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Deal */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-400" />
                <span>Chỉnh Sửa Hợp Đồng {editingDeal.dealId}</span>
              </h3>
              <button onClick={() => setEditingDeal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chủ Hợp Đồng / Khách Hàng</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dòng Xe</label>
                <input
                  type="text"
                  required
                  value={formData.carType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, carType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tổng Giá Trị (VND)</label>
                  <input
                    type="number"
                    required
                    value={formData.totalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalPrice: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thanh Toán</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Transfer">Chuyển Khoản</option>
                    <option value="Card">Thẻ Thẻ Quốc Tế</option>
                    <option value="Cash">Tiền Mặt</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? "Đang cập nhật..." : "Lưu Cập Nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Deal Modal */}
      {deletingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Hợp Đồng {deletingDeal.dealId}?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa hợp đồng của <strong className="text-rose-400">{deletingDeal.ownerName}</strong> khỏi MongoDB.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDeal(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? "Đang xóa..." : "Xác Nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
