"use client";

import { useState } from "react";
import { Plus, Trash2, AlertTriangle, X } from "lucide-react";
import type { ITracking } from "@/lib/models/Tracking";
import { TRACKING_STATUS, labelOf } from "@/lib/crm-labels";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface TrackingClientProps {
  initialTrackings: ITracking[];
}

export default function TrackingClient({ initialTrackings }: TrackingClientProps) {
  const [trackings, setTrackings] = useState<ITracking[]>(initialTrackings);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingTracking, setDeletingTracking] = useState<ITracking | null>(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "Nguyễn Văn H",
    carType: "VinFast VF 8 All New",
    status: "In Transit" as const,
    location: "Showroom Đà Nẵng",
    image: "/uploads/vf8.jpg",
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/tracking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setTrackings((prev) => [data.data, ...prev]);
        setIsAddOpen(false);
        notify({ type: "success", text: `Đã tạo tracking lead cho ${data.data.customerName}!` });
      } else {
        notify({ type: "error", text: data.message || "Tạo tracking thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (trk: ITracking) => {
    setLoading(true);
    const newStatus = trk.status === "Delivered" ? "In Transit" : "Delivered";

    try {
      const res = await adminFetch(`/api/admin/tracking/${trk._id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await readJson(res);

      if (data.success) {
        setTrackings((prev) => prev.map((t) => (t._id === trk._id ? { ...t, status: newStatus } : t)));
        notify({ type: "success", text: `Đã cập nhật trạng thái tracking sang ${newStatus}!` });
      }
    } catch {
      notify({ type: "error", text: "Cập nhật thất bại." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTracking) return;
    setLoading(true);

    try {
      const res = await adminFetch(`/api/admin/tracking/${deletingTracking._id}/`, {
        method: "DELETE",
      });
      const data = await readJson(res);

      if (data.success) {
        setTrackings((prev) => prev.filter((t) => t._id !== deletingTracking._id));
        notify({ type: "success", text: "Đã xóa tracking khỏi CSDL MongoDB." });
        setDeletingTracking(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Theo dõi giao xe</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400 font-semibold">{trackings.length} khách hàng lead</strong> theo dõi vận chuyển xe
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm bản ghi giao xe</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-sm text-slate-500">
            Chưa có bản ghi theo dõi giao xe nào.
          </div>
        )}

        {trackings.map((trk) => (
          <div
            key={String(trk._id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{trk.customerName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{trk.carName}</p>
                </div>
                <button
                  onClick={() => setDeletingTracking(trk)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="my-4 flex h-32 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước trong CRM, không ảnh hưởng LCP trang public */}
                <img
                  src={trk.carImage || "/uploads/vf8.jpg"}
                  alt={trk.customerName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="text-xs font-mono text-slate-400">{trk.locationAddress || "Đà Nẵng"}</span>

              <button
                onClick={() => handleToggleStatus(trk)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                  labelOf(TRACKING_STATUS, trk.status).className
                }`}
              >
                {labelOf(TRACKING_STATUS, trk.status).label}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Thêm bản ghi giao xe</span>
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
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dòng Xe Đặt Mua</label>
                <input
                  type="text"
                  required
                  value={formData.carType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, carType: e.target.value }))}
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
                  {loading ? "Đang tạo..." : "Lưu Tracking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Tracking Lead?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Xóa bản ghi tracking của khách hàng <strong className="text-rose-400">{deletingTracking.customerName}</strong> khỏi MongoDB.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTracking(null)}
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
