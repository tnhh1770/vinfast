import "server-only";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Calendar as CalendarIcon,
  Car,
  Gavel,
  Navigation,
  Plus,
  Terminal,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { requireAdminUser } from "@/lib/auth";
import { getCrmCars } from "@/lib/crm-db";
import { getCrmOverview, getRecentActivity } from "@/lib/crm-stats";
import type { LeadStatus } from "@/types";

export const metadata = {
  title: "Tổng quan — CRM VinFast Đà Nẵng",
};

const FUNNEL: { status: LeadStatus; label: string; bar: string }[] = [
  { status: "new", label: "Mới tiếp nhận", bar: "bg-blue-500" },
  { status: "contacted", label: "Đã liên hệ", bar: "bg-purple-500" },
  { status: "test_drive", label: "Hẹn lái thử", bar: "bg-amber-500" },
  { status: "negotiating", label: "Báo giá", bar: "bg-cyan-500" },
  { status: "won", label: "Chốt đơn", bar: "bg-emerald-500" },
  { status: "lost", label: "Thất bại", bar: "bg-rose-500" },
];

const QUICK_LINKS = [
  { href: "/admin/listing", label: "Thêm xe mới", icon: Plus, className: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20" },
  { href: "/admin/deals", label: "Tạo hợp đồng", icon: Briefcase, className: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20" },
  { href: "/admin/active-bids", label: "Mở đấu giá", icon: Gavel, className: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20" },
  { href: "/admin/calendar", label: "Đặt lịch hẹn", icon: CalendarIcon, className: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" },
  { href: "/admin/tracking", label: "Theo dõi giao xe", icon: Navigation, className: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20" },
];

function money(n: number) {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function compactMoney(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ ₫`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu ₫`;
  return money(n);
}

export default async function AdminDashboardPage() {
  await requireAdminUser();

  const [overview, activity, cars] = await Promise.all([
    getCrmOverview(),
    getRecentActivity(6),
    getCrmCars(),
  ]);

  const { counts, revenue, leadsByStatus } = overview;
  const funnelMax = Math.max(1, ...FUNNEL.map((f) => leadsByStatus[f.status]));

  const kpis = [
    {
      label: "Khách hàng tiềm năng",
      value: counts.leads.toLocaleString("vi-VN"),
      hint: `${overview.newLeads7Days} lead mới trong 7 ngày`,
      icon: Users,
      accent: "text-purple-400",
    },
    {
      label: "Hợp đồng",
      value: counts.deals.toLocaleString("vi-VN"),
      hint: `Giá trị đã ký ${compactMoney(revenue.dealPipeline)}`,
      icon: Briefcase,
      accent: "text-blue-400",
    },
    {
      label: "Doanh thu đã thu",
      value: compactMoney(revenue.paid),
      hint: `Còn ${compactMoney(revenue.pending)} chờ thanh toán`,
      icon: Wallet,
      accent: "text-emerald-400",
    },
    {
      label: "Tỉ lệ chốt đơn",
      value: `${overview.conversionRate}%`,
      hint: `${counts.activeBids} phiên đấu giá đang mở`,
      icon: TrendingUp,
      accent: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tổng quan</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {counts.cars} dòng xe · {counts.upcomingEvents} lịch hẹn sắp tới ·{" "}
            {counts.activeDeliveries} xe đang trên đường giao
          </p>
        </div>

        <Link
          href="/admin/api-console"
          className="flex items-center gap-1.5 self-start rounded-xl border border-blue-500/40 bg-blue-950 px-3.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-900"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Thử nghiệm API</span>
        </Link>
      </div>

      {/* KPI thật từ CSDL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <Icon className={`h-4 w-4 ${kpi.accent}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{kpi.value}</p>
              <p className="mt-1 text-[11px] text-slate-500">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Thao tác nhanh */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-sm">
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Thao tác nhanh
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-all ${link.className}`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Phễu bán hàng */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Users className="h-5 w-5 text-purple-400" />
              <span>Phễu bán hàng</span>
            </h2>
            <Link href="/admin/leads" className="text-xs font-medium text-blue-400 hover:underline">
              Quản lý lead →
            </Link>
          </div>

          {counts.leads === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">
              Chưa có khách hàng nào. Lead từ form trên website sẽ tự động xuất hiện ở đây.
            </p>
          ) : (
            <div className="space-y-3">
              {FUNNEL.map((step) => {
                const value = leadsByStatus[step.status];
                return (
                  <div key={step.status} className="flex items-center gap-3 text-xs">
                    <span className="w-28 shrink-0 text-slate-400">{step.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className={`h-full rounded-full ${step.bar}`}
                        style={{ width: `${(value / funnelMax) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-bold text-white">{value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hoạt động gần đây */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <h2 className="border-b border-slate-800 pb-3 text-base font-bold text-white">
            Hoạt động gần đây
          </h2>

          {activity.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">Chưa có hoạt động nào.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((row) => (
                <div
                  key={`${row.kind}-${row.id}`}
                  className="rounded-xl border border-slate-800/80 bg-slate-950 p-3 shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                          {row.kind}
                        </span>
                        <h3 className="truncate text-xs font-bold text-white">{row.title}</h3>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{row.subtitle}</p>
                      <span className="text-[10px] text-slate-500">
                        {row.at ? new Date(row.at).toLocaleDateString("vi-VN") : ""}
                      </span>
                    </div>
                    {row.amount !== null && (
                      <span className="shrink-0 text-xs font-bold text-emerald-400">
                        {compactMoney(row.amount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kho xe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Car className="h-5 w-5 text-blue-400" />
            <span>Kho xe ({cars.length})</span>
          </h2>
          <Link href="/admin/listing" className="text-xs font-medium text-blue-400 hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-14 text-center text-sm text-slate-500">
            Chưa có xe nào trong cơ sở dữ liệu. Chạy <code className="text-slate-300">npm run seed</code>{" "}
            hoặc thêm xe ở mục Listing.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.slice(0, 6).map((car) => (
              <div
                key={car.slug || String(car._id)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white transition-colors group-hover:text-blue-400">
                      {car.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {car.category || "Xe ô tô điện"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-blue-800/40 bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                    {car.nedc || "EV"}
                  </span>
                </div>

                <div className="my-4 flex h-28 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-950/80 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={car.thumbnail || car.heroImage || "/uploads/vf8.jpg"}
                    alt={car.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-base font-bold text-emerald-400">
                    {car.price ? money(car.price) : "Liên hệ"}
                  </span>
                  <Link
                    href={`/admin/cars/${car.slug}/`}
                    className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-600 hover:text-white"
                  >
                    <span>Chi tiết</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
