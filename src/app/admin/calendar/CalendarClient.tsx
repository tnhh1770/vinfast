"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { ICalendarEvent } from "@/lib/models/CalendarEvent";
import { CALENDAR_TYPE, labelOf } from "@/lib/crm-labels";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface CalendarClientProps {
  initialEvents: ICalendarEvent[];
}

type EventType = ICalendarEvent["type"];

const TYPES = (Object.keys(CALENDAR_TYPE) as EventType[]).map((value) => ({
  value,
  ...CALENDAR_TYPE[value],
}));

const typeMeta = (t?: EventType) => labelOf(CALENDAR_TYPE, t);

function emptyForm() {
  return {
    title: "",
    customerName: "",
    carName: "",
    date: new Date().toISOString().slice(0, 10),
    timeSlot: "09:00 - 10:30",
    type: "TestDrive" as EventType,
  };
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<ICalendarEvent[]>(initialEvents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ICalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ICalendarEvent | null>(null);
  const [formData, setFormData] = useState(emptyForm);  // lazy initializer

  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Lịch sắp tới lên đầu, lịch đã qua xuống dưới.
  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [events],
  );
  const upcoming = sorted.filter((e) => (e.date || "") >= today);
  const past = sorted.filter((e) => (e.date || "") < today).reverse();

  function openAdd() {
    setEditingEvent(null);
    setFormData(emptyForm());
    setIsFormOpen(true);
  }

  function openEdit(ev: ICalendarEvent) {
    setEditingEvent(ev);
    setFormData({
      title: ev.title || "",
      customerName: ev.customerName || "",
      carName: ev.carName || "",
      date: ev.date || today,
      timeSlot: ev.timeSlot || "",
      type: ev.type || "TestDrive",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    notify(null);

    const isEdit = Boolean(editingEvent);
    const url = isEdit ? `/api/admin/calendar/${editingEvent!._id}/` : "/api/admin/calendar/";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setEvents((prev) =>
          isEdit
            ? prev.map((ev) => (ev._id === editingEvent!._id ? data.data : ev))
            : [data.data, ...prev],
        );
        setIsFormOpen(false);
        setEditingEvent(null);
        notify({
          type: "success",
          text: isEdit ? "Đã cập nhật lịch hẹn." : `Đã tạo lịch hẹn “${data.data.title}”.`,
        });
      } else {
        notify({ type: "error", text: data.message || "Lưu lịch hẹn thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingEvent) return;
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch(`/api/admin/calendar/${deletingEvent._id}/`, { method: "DELETE" });
      const data = await readJson(res);

      if (data.success) {
        setEvents((prev) => prev.filter((ev) => ev._id !== deletingEvent._id));
        notify({ type: "success", text: "Đã xoá lịch hẹn." });
        setDeletingEvent(null);
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

  function renderRow(ev: ICalendarEvent, dimmed = false) {
    const meta = typeMeta(ev.type);
    return (
      <div
        key={String(ev._id)}
        className={`flex items-center justify-between gap-4 py-3.5 ${dimmed ? "opacity-60" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-white">{ev.title}</h4>
            <p className="truncate text-xs text-slate-400">
              Khách: <strong className="text-slate-200">{ev.customerName}</strong> · Xe:{" "}
              <strong className="text-blue-300">{ev.carName}</strong>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right text-xs">
            <span className="block font-mono text-slate-300">{ev.timeSlot}</span>
            <span className="font-mono text-[11px] text-slate-500">
              {ev.date ? new Date(ev.date).toLocaleDateString("vi-VN") : "—"}
            </span>
          </div>

          <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
            {meta.label}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEdit(ev)}
              title="Sửa lịch hẹn"
              className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-blue-600 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeletingEvent(ev)}
              title="Xoá lịch hẹn"
              className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-rose-600 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Lịch hẹn khách hàng</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            <strong className="font-semibold text-emerald-400">{upcoming.length}</strong> lịch sắp tới ·{" "}
            {past.length} lịch đã qua
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo lịch hẹn</span>
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
        <h2 className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
          <CalendarIcon className="h-4 w-4 text-blue-400" />
          <span>Sắp tới ({upcoming.length})</span>
        </h2>

        {upcoming.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-500">
            Không có lịch hẹn nào sắp tới. Bấm “Tạo lịch hẹn” để thêm mới.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80">{upcoming.map((ev) => renderRow(ev))}</div>
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
          <h2 className="border-b border-slate-800 pb-3 text-sm font-bold text-slate-400">
            Đã qua ({past.length})
          </h2>
          <div className="divide-y divide-slate-800/80">{past.map((ev) => renderRow(ev, true))}</div>
        </div>
      )}

      {/* Modal thêm / sửa */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                {editingEvent ? (
                  <Pencil className="h-5 w-5 text-blue-400" />
                ) : (
                  <Plus className="h-5 w-5 text-emerald-400" />
                )}
                <span>{editingEvent ? "Sửa lịch hẹn" : "Tạo lịch hẹn mới"}</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="cal-title" className="mb-1 block font-semibold text-slate-300">
                  Tiêu đề lịch hẹn *
                </label>
                <input
                  id="cal-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cal-customer" className="mb-1 block font-semibold text-slate-300">
                    Tên khách hàng *
                  </label>
                  <input
                    id="cal-customer"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="cal-car" className="mb-1 block font-semibold text-slate-300">
                    Dòng xe *
                  </label>
                  <input
                    id="cal-car"
                    type="text"
                    required
                    value={formData.carName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, carName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cal-date" className="mb-1 block font-semibold text-slate-300">
                    Ngày hẹn *
                  </label>
                  <input
                    id="cal-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="cal-slot" className="mb-1 block font-semibold text-slate-300">
                    Khung giờ *
                  </label>
                  <input
                    id="cal-slot"
                    type="text"
                    required
                    placeholder="09:00 - 10:30"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeSlot: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cal-type" className="mb-1 block font-semibold text-slate-300">
                  Loại lịch hẹn
                </label>
                <select
                  id="cal-type"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as EventType }))}
                  className={inputClass}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
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
                    editingEvent
                      ? "bg-blue-600 shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
                  }`}
                >
                  {loading ? "Đang lưu..." : editingEvent ? "Lưu thay đổi" : "Lưu lịch hẹn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xoá */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-rose-900/60 bg-slate-900 p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Xoá lịch hẹn?</h3>
            <p className="text-xs text-slate-400">
              Lịch <strong className="text-slate-200">“{deletingEvent.title}”</strong> sẽ bị xoá vĩnh viễn.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
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
