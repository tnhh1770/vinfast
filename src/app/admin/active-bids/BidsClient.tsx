"use client";

import { useState } from "react";
import { Plus, Gavel, Trash2, AlertTriangle, X } from "lucide-react";
import type { IBid } from "@/lib/models/Bid";
import { BID_STATUS, labelOf } from "@/lib/crm-labels";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface BidsClientProps {
  initialBids: IBid[];
}

export default function BidsClient({ initialBids }: BidsClientProps) {
  const [bids, setBids] = useState<IBid[]>(initialBids);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingBid, setDeletingBid] = useState<IBid | null>(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    carName: "VinFast VF 8 All New",
    currentBid: 900000000,
    image: "/uploads/vf8.jpg",
    location: "Đà Nẵng",
    style: "VF Electric",
    bidder: "Lê Văn E",
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/bids/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setBids((prev) => [data.data, ...prev]);
        setIsAddOpen(false);
        notify({ type: "success", text: `Đã mở phiên đấu giá cho xe ${data.data.carName}!` });
      } else {
        notify({ type: "error", text: data.message || "Tạo đấu giá thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (bid: IBid) => {
    setLoading(true);
    notify(null);

    try {
      // Endpoint tự tính bước giá tối thiểu và kiểm tra phiên còn mở hay không.
      const res = await adminFetch(`/api/admin/bids/${bid._id}/place-bid/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setBids((prev) => prev.map((b) => (b._id === bid._id ? data.data : b)));
        notify({ type: "success", text: data.message || "Đã nâng giá đấu thành công." });
      } else {
        notify({ type: "error", text: data.message || "Đặt mức đấu giá thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (bid: IBid) => {
    setLoading(true);
    notify(null);
    const nextStatus = bid.status === "Active" ? "Closed" : "Active";

    try {
      const res = await adminFetch(`/api/admin/bids/${bid._id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setBids((prev) => prev.map((b) => (b._id === bid._id ? data.data : b)));
        notify({
          type: "success",
          text: nextStatus === "Closed" ? "Đã đóng phiên đấu giá." : "Đã mở lại phiên đấu giá.",
        });
      } else {
        notify({ type: "error", text: data.message || "Cập nhật trạng thái thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBid) return;
    setLoading(true);

    try {
      const res = await adminFetch(`/api/admin/bids/${deletingBid._id}/`, {
        method: "DELETE",
      });
      const data = await readJson(res);

      if (data.success) {
        setBids((prev) => prev.filter((b) => b._id !== deletingBid._id));
        notify({ type: "success", text: `Đã xóa phiên đấu giá xe ${deletingBid.carName} khỏi MongoDB.` });
        setDeletingBid(null);
      } else {
        notify({ type: "error", text: data.message || "Xóa thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sàn đấu giá</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            <strong className="text-blue-400 font-semibold">{bids.filter((b) => b.status === "Active").length}</strong> phiên đang mở trên tổng số {bids.length} phiên trong cơ sở dữ liệu
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tạo Phiên Đấu Giá Mới</span>
        </button>
      </div>

      {bids.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-sm text-slate-500">
          Chưa có phiên đấu giá nào. Bấm “Tạo Phiên Đấu Giá Mới” để bắt đầu.
        </div>
      )}

      {/* Grid of Bids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bids.map((bid) => (
          <div
            key={String(bid._id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                    {bid.carName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{bid.location || "Đà Nẵng"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(bid)}
                    disabled={loading}
                    title={bid.status === "Active" ? "Đóng phiên đấu giá" : "Mở lại phiên đấu giá"}
                    className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-bold transition-all hover:brightness-125 disabled:opacity-50 ${
                      labelOf(BID_STATUS, bid.status).className
                    }`}
                  >
                    {labelOf(BID_STATUS, bid.status).label}
                  </button>
                  <button
                    onClick={() => setDeletingBid(bid)}
                    title="Xoá phiên đấu giá"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-4 flex h-36 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước trong CRM, không ảnh hưởng LCP trang public */}
                <img
                  src={bid.image || "/uploads/vf8.jpg"}
                  alt={bid.carName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Price & Bid Action */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Mức giá đấu hiện tại</span>
                <span className="text-base font-bold text-emerald-400">
                  {bid.currentBid ? `${bid.currentBid.toLocaleString("vi-VN")} ₫` : "Khởi điểm"}
                </span>
              </div>

              <button
                onClick={() => handlePlaceBid(bid)}
                disabled={loading || bid.status !== "Active"}
                title={bid.status === "Active" ? "Nâng giá thêm 10 triệu" : "Phiên đã đóng"}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 transition-all cursor-pointer"
              >
                <Gavel className="h-3.5 w-3.5" />
                <span>Nâng giá +10 triệu</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Bid */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Tạo Phiên Đấu Giá Mới</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Dòng Xe *</label>
                <input
                  type="text"
                  required
                  value={formData.carName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, carName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá Khởi Điểm (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formData.currentBid}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentBid: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Địa Điểm Showroom</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Hình Ảnh Xe</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
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
                  {loading ? "Đang tạo..." : "Mở Đấu Giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Bid */}
      {deletingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Phiên Đấu Giá?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa phiên đấu giá xe <strong className="text-rose-400">{deletingBid.carName}</strong> khỏi CSDL MongoDB?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBid(null)}
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
