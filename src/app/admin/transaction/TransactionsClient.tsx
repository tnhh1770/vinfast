"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { ITransaction } from "@/lib/models/Transaction";

interface TransactionsClientProps {
  initialTransactions: ITransaction[];
}

export default function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<ITransaction | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    transactionId: `#TX-1001`,
    ownerName: "Nguyễn Văn G",
    carType: "VinFast VF 8",
    totalMoney: 50000000,
    paymentMethod: "Cash" as const,
    status: "Paid" as const,
    date: "05/09/2026",
    creationDate: "05/09/2026",
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setTransactions((prev) => [data.data, ...prev]);
        setIsAddOpen(false);
        setMessage({ type: "success", text: `Đã ghi nhận giao dịch ${data.data.totalMoney.toLocaleString("vi-VN")} ₫!` });
      } else {
        setMessage({ type: "error", text: data.message || "Tạo giao dịch thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/transactions/${deletingTx._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setTransactions((prev) => prev.filter((t) => t._id !== deletingTx._id));
        setMessage({ type: "success", text: "Đã xóa giao dịch khỏi CSDL MongoDB." });
        setDeletingTx(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions (Giao Dịch Tài Chính MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-emerald-400 font-semibold">{transactions.length} giao dịch</strong> lưu trong CSDL
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tạo Giao Dịch Mới</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
          <span>Lịch Sử Giao Dịch ({transactions.length})</span>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Khách Hàng / Xe</th>
              <th className="px-5 py-3.5">Phương Thức</th>
              <th className="px-5 py-3.5">Ngày Thực Hiện</th>
              <th className="px-5 py-3.5">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Số Tiền (VND)</th>
              <th className="px-5 py-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {transactions.map((tx) => (
              <tr key={String(tx._id)} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-bold text-white block">{tx.ownerName || "Khách hàng"}</span>
                  <span className="text-[11px] text-slate-400">{tx.carType || "VinFast"}</span>
                </td>
                <td className="px-5 py-4 text-slate-400 font-mono">{tx.paymentMethod || "Cash"}</td>
                <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{tx.date || "05/09/2026"}</td>
                <td className="px-5 py-4">
                  <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/40">
                    {tx.status || "Paid"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold text-emerald-400 text-sm">
                  {tx.totalMoney ? `${tx.totalMoney.toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => setDeletingTx(tx)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Tx */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Ghi Nhận Giao Dịch Mới</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Khách Hàng *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số Tiền (VND)</label>
                  <input
                    type="number"
                    required
                    value={formData.totalMoney}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalMoney: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
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
                  {loading ? "Đang tạo..." : "Lưu Giao Dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Giao Dịch?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa giao dịch của <strong className="text-rose-400">{deletingTx.ownerName}</strong> khỏi CSDL?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
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
