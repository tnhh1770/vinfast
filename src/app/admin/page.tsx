import "server-only";
import { getSessionUser } from "@/lib/auth";
import {
  getCrmCars,
  getCrmDeals,
  getCrmTrackings,
  getCrmTransactions,
  getCrmLeads,
} from "@/lib/crm-db";
import { Download, Calendar as CalendarIcon, Clock, ArrowUpRight, Car } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — CarEmpire CRM",
};

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  const cars = await getCrmCars();
  const deals = await getCrmDeals();
  const transactions = await getCrmTransactions();
  const leads = await getCrmLeads();
  const trackings = await getCrmTrackings();

  // Compute real recent activity logs from database
  const recentActivities = [
    ...transactions.slice(0, 3).map((t) => ({
      id: t._id || t.transactionId,
      user: t.ownerName,
      location: "Đà Nẵng, VN",
      price: `${t.totalMoney.toLocaleString("vi-VN")} ₫`,
      time: t.creationDate || "Mới",
      status: t.status,
    })),
    ...deals.slice(0, 2).map((d) => ({
      id: d._id || d.dealId,
      user: d.ownerName,
      location: "Khách hàng Deal",
      price: `${d.totalPrice.toLocaleString("vi-VN")} ₫`,
      time: d.creationDate || "Mới",
      status: d.status,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard (Dữ liệu thật MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400">{cars.length} xe</strong>,{" "}
            <strong className="text-emerald-400">{deals.length} hợp đồng</strong>,{" "}
            <strong className="text-purple-400">{leads.length} leads</strong> từ CSDL database
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>05-Sep-2026 — Realtime DB</span>
          </div>

          <a
            href="/api/admin/stats/overview"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export API ↓</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Available Cars & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Available Cars Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-400" />
              <span>Available Cars ({cars.length} dòng xe trong DB)</span>
            </h2>
            <Link href="/admin/listing" className="text-xs font-medium text-blue-400 hover:underline">
              Xem tất cả kho xe →
            </Link>
          </div>

          {/* Real Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cars.slice(0, 6).map((car) => (
              <div
                key={car.slug || String(car._id)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {car.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{car.category || "Xe ô tô điện"}</p>
                  </div>
                  <span className="rounded-md bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800/40">
                    {car.group || "VinFast"}
                  </span>
                </div>

                <div className="my-4 flex items-center justify-center py-2">
                  <div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60">
                    <img
                      src={car.thumbnail || car.heroImage || "/uploads/vf8.jpg"}
                      alt={car.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-base font-bold text-emerald-400">
                    {car.price ? `${car.price.toLocaleString("vi-VN")} ₫` : "Liên hệ đại lý"}
                  </span>
                  <Link
                    href={`/admin/cars/${car.slug}/`}
                    className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <span>Chi tiết</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Sidebar from DB */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Hoạt động Giao dịch DB Realtime</h3>
            <span className="text-[11px] text-slate-400 font-mono">Live DB</span>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950 p-3 shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 font-bold text-blue-400">
                    {act.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{act.user}</h4>
                    <p className="text-[11px] text-slate-400">{act.location}</p>
                    <span className="text-[10px] text-slate-500">{act.time}</span>
                  </div>
                </div>
                <span className="font-bold text-xs text-emerald-400">{act.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
