"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, AlertTriangle, X, Clock, Calendar as CalendarIcon } from "lucide-react";
import type { ICalendarEvent } from "@/lib/models/CalendarEvent";

interface CalendarClientProps {
  initialEvents: ICalendarEvent[];
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<ICalendarEvent[]>(initialEvents);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<ICalendarEvent | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "Lái thử xe VinFast VF 8",
    timeSlot: "10:00 AM - 11:30 AM",
    date: "2026-09-10",
    customerName: "Nguyễn Văn F",
    carName: "VinFast VF 8",
    type: "TestDrive" as const,
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setEvents((prev) => [data.data, ...prev]);
        setIsAddOpen(false);
        setMessage({ type: "success", text: `Đã tạo lịch hẹn "${data.data.title}" thành công!` });
      } else {
        setMessage({ type: "error", text: data.message || "Tạo lịch thất bại." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/calendar/${deletingEvent._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setEvents((prev) => prev.filter((e) => e._id !== deletingEvent._id));
        setMessage({ type: "success", text: "Đã xóa lịch hẹn khỏi CSDL MongoDB." });
        setDeletingEvent(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar (Quản Lý Lịch Hẹn MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-emerald-400 font-semibold">{events.length} lịch hẹn</strong> lái thử & bàn giao xe
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tạo Lịch Hẹn Mới</span>
        </button>
      </div>

      {/* Events Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-400" />
          <span>Danh Sách Lịch Hẹn Khách Hàng ({events.length})</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {events.map((ev) => (
            <div key={String(ev._id)} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                  <p className="text-xs text-slate-400">
                    Khách: <strong className="text-slate-200">{ev.customerName || "Nguyễn Văn A"}</strong> • Xe: <strong className="text-blue-300">{ev.carName || "VinFast VF 8"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <span className="block font-mono text-slate-300">{ev.timeSlot || "10:00 AM"}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{ev.date || "10/09/2026"}</span>
                </div>

                <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-emerald-800/50 bg-emerald-950 text-emerald-300">
                  {ev.type || "TestDrive"}
                </span>

                <button
                  onClick={() => setDeletingEvent(ev)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Event */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Tạo Lịch Hẹn Mới</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tiêu Đề Lịch Hẹn *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên Khách Hàng</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dòng Xe Quan Tâm</label>
                  <input
                    type="text"
                    required
                    value={formData.carName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, carName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày Hẹn</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Khung Giờ</label>
                  <input
                    type="text"
                    required
                    value={formData.timeSlot}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
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
                  {loading ? "Đang lưu..." : "Lưu Lịch Hẹn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Event */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Lịch Hẹn?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa lịch hẹn <strong className="text-rose-400">{deletingEvent.title}</strong> không?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
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
