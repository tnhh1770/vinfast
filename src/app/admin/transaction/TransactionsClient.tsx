"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import type { ITransaction } from "@/lib/models/Transaction";
import { TRANSACTION_STATUS, PAYMENT_METHOD, labelOf } from "@/lib/crm-labels";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface TransactionsClientProps {
  initialTransactions: ITransaction[];
}

type TxStatus = ITransaction["status"];
type TxMethod = ITransaction["paymentMethod"];

/** dd/mm/yyyy — đúng định dạng đang lưu trong collection `transactions`. */
function todayVn() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Mã giao dịch có ràng buộc unique nên phải sinh mới mỗi lần, không hardcode. */
function newTransactionId() {
  return `#TX-${Date.now().toString().slice(-8)}`;
}

const money = (n?: number) => `${(n || 0).toLocaleString("vi-VN")} ₫`;

export default function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<ITransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<ITransaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TxStatus>("all");

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => ({
    transactionId: newTransactionId(),
    ownerName: "",
    carType: "",
    totalMoney: 0,
    paymentMethod: "Cash" as TxMethod,
    status: "Paid" as TxStatus,
    date: todayVn(),
    creationDate: todayVn(),
  }));

  const filtered = useMemo(
    () => (statusFilter === "all" ? transactions : transactions.filter((t) => t.status === statusFilter)),
    [transactions, statusFilter],
  );

  const totals = useMemo(() => {
    const sum = (s: TxStatus) =>
      transactions.filter((t) => t.status === s).reduce((acc, t) => acc + (t.totalMoney || 0), 0);
    return { paid: sum("Paid"), pending: sum("Pending"), failed: sum("Failed") };
  }, [transactions]);

  function openAdd() {
    setEditingTx(null);
    setFormData({
      transactionId: newTransactionId(),
      ownerName: "",
      carType: "",
      totalMoney: 0,
      paymentMethod: "Cash",
      status: "Paid",
      date: todayVn(),
      creationDate: todayVn(),
    });
    setIsFormOpen(true);
  }

  function openEdit(tx: ITransaction) {
    setEditingTx(tx);
    setFormData({
      transactionId: tx.transactionId,
      ownerName: tx.ownerName || "",
      carType: tx.carType || "",
      totalMoney: tx.totalMoney || 0,
      paymentMethod: tx.paymentMethod || "Cash",
      status: tx.status || "Paid",
      date: tx.date || todayVn(),
      creationDate: tx.creationDate || todayVn(),
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    notify(null);

    const isEdit = Boolean(editingTx);
    const url = isEdit ? `/api/admin/transactions/${editingTx!._id}/` : "/api/admin/transactions/";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setTransactions((prev) =>
          isEdit ? prev.map((t) => (t._id === editingTx!._id ? data.data : t)) : [data.data, ...prev],
        );
        setIsFormOpen(false);
        setEditingTx(null);
        notify({
          type: "success",
          text: isEdit ? "Đã cập nhật giao dịch." : `Đã ghi nhận giao dịch ${data.data.transactionId}.`,
        });
      } else {
        notify({ type: "error", text: data.message || "Lưu giao dịch thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingTx) return;
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch(`/api/admin/transactions/${deletingTx._id}/`, { method: "DELETE" });
      const data = await readJson(res);

      if (data.success) {
        setTransactions((prev) => prev.filter((t) => t._id !== deletingTx._id));
        notify({ type: "success", text: "Đã xoá giao dịch." });
        setDeletingTx(null);
      } else {
        notify({ type: "error", text: data.message || "Xoá thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Giao dịch tài chính</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {transactions.length} giao dịch trong cơ sở dữ liệu
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          <span>Ghi nhận giao dịch</span>
        </button>
      </div>

      {/* Tổng hợp */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(
          [
            ["Đã thu", totals.paid, "text-emerald-400"],
            ["Chờ thanh toán", totals.pending, "text-amber-400"],
            ["Thất bại", totals.failed, "text-rose-400"],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            <p className={`mt-2 text-xl font-bold ${color}`}>{money(value)}</p>
          </div>
        ))}
      </div>

      {/* Lọc theo trạng thái */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "Paid", "Pending", "Failed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === s
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            {s === "all" ? "Tất cả" : labelOf(TRANSACTION_STATUS, s).label}
          </button>
        ))}
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Mã giao dịch</th>
              <th className="px-5 py-3.5">Khách hàng / Xe</th>
              <th className="px-5 py-3.5">Phương thức</th>
              <th className="px-5 py-3.5">Ngày thực hiện</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Số tiền</th>
              <th className="px-5 py-3.5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((tx) => {
              const meta = labelOf(TRANSACTION_STATUS, tx.status);
              return (
                <tr key={String(tx._id)} className="transition-colors hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-mono text-blue-300">{tx.transactionId}</td>
                  <td className="px-5 py-4">
                    <span className="block font-bold text-white">{tx.ownerName}</span>
                    <span className="text-[11px] text-slate-400">{tx.carType}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-400">
                    {labelOf(PAYMENT_METHOD, tx.paymentMethod).label}
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{tx.date}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-bold text-emerald-400">
                    {money(tx.totalMoney)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(tx)}
                        title="Sửa giao dịch"
                        className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-blue-600 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingTx(tx)}
                        title="Xoá giao dịch"
                        className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="py-14 text-center text-xs text-slate-500">
            {transactions.length === 0
              ? "Chưa có giao dịch nào. Bấm “Ghi nhận giao dịch” để thêm mới."
              : "Không có giao dịch nào ở trạng thái này."}
          </p>
        )}
      </div>

      {/* Modal thêm / sửa */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                {editingTx ? (
                  <Pencil className="h-5 w-5 text-blue-400" />
                ) : (
                  <Plus className="h-5 w-5 text-emerald-400" />
                )}
                <span>{editingTx ? "Sửa giao dịch" : "Ghi nhận giao dịch mới"}</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-id" className="mb-1 block font-semibold text-slate-300">
                    Mã giao dịch *
                  </label>
                  <input
                    id="tx-id"
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData((p) => ({ ...p, transactionId: e.target.value }))}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="tx-owner" className="mb-1 block font-semibold text-slate-300">
                    Tên khách hàng *
                  </label>
                  <input
                    id="tx-owner"
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData((p) => ({ ...p, ownerName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-car" className="mb-1 block font-semibold text-slate-300">
                    Dòng xe *
                  </label>
                  <input
                    id="tx-car"
                    type="text"
                    required
                    value={formData.carType}
                    onChange={(e) => setFormData((p) => ({ ...p, carType: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="tx-money" className="mb-1 block font-semibold text-slate-300">
                    Số tiền (₫) *
                  </label>
                  <input
                    id="tx-money"
                    type="number"
                    required
                    min={0}
                    value={formData.totalMoney}
                    onChange={(e) => setFormData((p) => ({ ...p, totalMoney: Number(e.target.value) }))}
                    className={`${inputClass} font-bold text-emerald-400`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-method" className="mb-1 block font-semibold text-slate-300">
                    Phương thức
                  </label>
                  <select
                    id="tx-method"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, paymentMethod: e.target.value as TxMethod }))
                    }
                    className={inputClass}
                  >
                    <option value="Cash">Tiền mặt</option>
                    <option value="Card">Chuyển khoản / Thẻ</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tx-status" className="mb-1 block font-semibold text-slate-300">
                    Trạng thái
                  </label>
                  <select
                    id="tx-status"
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as TxStatus }))}
                    className={inputClass}
                  >
                    <option value="Paid">Đã thanh toán</option>
                    <option value="Pending">Chờ thanh toán</option>
                    <option value="Failed">Thất bại</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tx-date" className="mb-1 block font-semibold text-slate-300">
                  Ngày thực hiện (dd/mm/yyyy) *
                </label>
                <input
                  id="tx-date"
                  type="text"
                  required
                  pattern="\d{1,2}/\d{1,2}/\d{4}"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value, creationDate: e.target.value }))}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg disabled:opacity-50 ${
                    editingTx
                      ? "bg-blue-600 shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
                  }`}
                >
                  {loading ? "Đang lưu..." : editingTx ? "Lưu thay đổi" : "Lưu giao dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xoá */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-rose-900/60 bg-slate-900 p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Xoá giao dịch?</h3>
            <p className="text-xs text-slate-400">
              Giao dịch <strong className="text-slate-200">{deletingTx.transactionId}</strong> (
              {money(deletingTx.totalMoney)}) sẽ bị xoá vĩnh viễn.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTx(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
