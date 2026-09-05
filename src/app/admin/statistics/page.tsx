import "server-only";
import { BarChart3, Download, PieChart, Radio, Target } from "lucide-react";

import { requireAdminUser } from "@/lib/auth";
import { getCrmAnalytics, getCrmOverview } from "@/lib/crm-stats";

export const metadata = {
  title: "Báo cáo — CRM VinFast Đà Nẵng",
};

function compactMoney(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
  return n.toLocaleString("vi-VN");
}

export default async function AdminStatisticsPage() {
  await requireAdminUser();

  const [analytics, overview] = await Promise.all([getCrmAnalytics(), getCrmOverview()]);
  const { months, carsByCategory, leadsBySource, topCarInterest, maxLeads, maxRevenue } = analytics;

  const hasMonthlyData = months.some((m) => m.leads > 0 || m.revenue > 0);
  const maxCategory = Math.max(1, ...carsByCategory.map((c) => c.count));
  const maxSource = Math.max(1, ...leadsBySource.map((s) => s.count));
  const maxInterest = Math.max(1, ...topCarInterest.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Báo cáo &amp; Phân tích</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Tổng hợp trực tiếp từ {overview.counts.leads} lead, {overview.counts.deals} hợp đồng và{" "}
            {overview.counts.transactions} giao dịch trong cơ sở dữ liệu.
          </p>
        </div>

        <a
          href="/api/admin/stats/analytics/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 self-start rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Xuất JSON</span>
        </a>
      </div>

      {/* Tóm tắt */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Khách hàng đã tiếp nhận", value: overview.counts.leads.toLocaleString("vi-VN") },
          { label: "Chốt đơn thành công", value: overview.leadsByStatus.won.toLocaleString("vi-VN") },
          { label: "Tỉ lệ chuyển đổi", value: `${overview.conversionRate}%` },
          { label: "Doanh thu đã thu", value: `${compactMoney(overview.revenue.paid)} ₫` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {item.label}
            </span>
            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Biểu đồ theo tháng */}
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span>Khách hàng &amp; doanh thu 9 tháng gần nhất</span>
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Lead
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Doanh thu
              </span>
            </div>
          </div>

          {!hasMonthlyData ? (
            <p className="py-16 text-center text-xs text-slate-500">
              Chưa đủ dữ liệu để dựng biểu đồ. Số liệu sẽ xuất hiện khi có lead và giao dịch mới.
            </p>
          ) : (
            <div className="flex h-56 items-end justify-between gap-2 border-b border-slate-800 px-2 pb-2">
              {months.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-44 w-full items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t bg-blue-500 transition-all"
                      style={{ height: `${(item.leads / maxLeads) * 100}%` }}
                      title={`${item.leads} lead`}
                    />
                    <div
                      className="w-3 rounded-t bg-emerald-500 transition-all"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      title={`${compactMoney(item.revenue)} ₫`}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phân khúc xe */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <PieChart className="h-4 w-4 text-purple-400" />
            <span>Phân khúc xe trong kho</span>
          </h2>
          {carsByCategory.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Chưa có dữ liệu xe.</p>
          ) : (
            <div className="space-y-3">
              {carsByCategory.map((row) => (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{row.name}</span>
                    <span className="text-slate-400">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${(row.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Nguồn lead */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Radio className="h-4 w-4 text-amber-400" />
            <span>Khách hàng theo nguồn</span>
          </h2>
          {leadsBySource.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Chưa có lead nào.</p>
          ) : (
            <div className="space-y-3">
              {leadsBySource.map((row) => (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{row.name}</span>
                    <span className="text-slate-400">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${(row.count / maxSource) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dòng xe được quan tâm */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Target className="h-4 w-4 text-emerald-400" />
            <span>Dòng xe được quan tâm nhất</span>
          </h2>
          {topCarInterest.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Chưa có dữ liệu quan tâm.</p>
          ) : (
            <div className="space-y-3">
              {topCarInterest.map((row) => (
                <div key={row.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{row.name}</span>
                    <span className="text-slate-400">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(row.count / maxInterest) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
