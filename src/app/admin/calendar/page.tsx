import "server-only";
import { getCrmCalendarEvents } from "@/lib/crm-db";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

export const metadata = {
  title: "Calendar — CarEmpire CRM",
};

export default async function AdminCalendarPage() {
  const events = await getCrmCalendarEvents();
  const days = ["Sunday 01", "Tuesday 03", "Wednesday 04", "Thursday 05", "Friday 06", "Saturday 07"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar Lịch Hẹn (MongoDB Database)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400 font-semibold">{events.length} lịch hẹn</strong> lái thử & bàn giao xe từ CSDL
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300">
            All Dates
          </button>
          <button className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300">
            Today
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            <button><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-semibold text-white">Sep 05-16, 2026</span>
            <button><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Real Calendar Events List & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm shadow-xl">
          <div className="min-w-[600px]">
            {/* Days Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-800 pb-3 text-center text-xs font-bold text-slate-300">
              <div className="text-slate-500 font-mono">Time Slot</div>
              {days.map((day) => (
                <div key={day} className="text-slate-200">{day}</div>
              ))}
            </div>

            {/* Time Slots Rows */}
            <div className="divide-y divide-slate-800/80 text-xs">
              {["09-10", "10-11", "11-12", "14-15", "15-16", "16-17"].map((slot, sIdx) => (
                <div key={slot} className="grid grid-cols-7 items-center py-3 text-center min-h-[56px]">
                  <div className="font-mono text-[11px] text-slate-500">{slot}:00</div>
                  {days.map((_, dIdx) => {
                    const matchedEvent = events[ (sIdx + dIdx) % events.length ];
                    const hasEvent = (sIdx === 0 && dIdx === 1) || (sIdx === 2 && dIdx === 3);
                    return (
                      <div key={dIdx} className="px-1">
                        {hasEvent && matchedEvent ? (
                          <div className="rounded-lg bg-blue-600/30 border border-blue-500/40 p-1.5 text-left text-[10px] text-blue-200 shadow">
                            <span className="font-bold block text-white">{matchedEvent.title}</span>
                            <span className="text-slate-400">{matchedEvent.customerName}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real Events List from Database */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
            Danh sách Lịch Hẹn DB Realtime
          </h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1">
                <div className="flex justify-between font-bold text-blue-400">
                  <span>{ev.title}</span>
                  <span className="text-slate-500 text-[10px]">{ev.type}</span>
                </div>
                <p className="text-slate-200">Khách hàng: <strong>{ev.customerName}</strong></p>
                <p className="text-slate-400 font-mono text-[11px]">Xe: {ev.carName} — {ev.timeSlot}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
