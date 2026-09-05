"use client";

import { useState } from "react";
import { LayoutGrid, Table as TableIcon, Download, Search, Filter } from "lucide-react";
import type { Lead } from "@/types";
import { LeadStatsCards } from "./lead-stats-cards";
import { LeadKanban } from "./lead-kanban";
import { LeadTable } from "./lead-table";
import { LeadDetailModal } from "./lead-detail-modal";

interface LeadManagementClientProps {
  initialLeads: Lead[];
  userRole: string;
}

export function LeadManagementClient({ initialLeads, userRole }: LeadManagementClientProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [carFilter, setCarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Extract unique cars from leads for filter dropdown
  const cars = Array.from(new Set(initialLeads.map((l) => l.carInterest).filter(Boolean)));

  const filteredLeads = initialLeads.filter((lead) => {
    const matchSearch =
      !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search) ||
      lead.carInterest?.toLowerCase().includes(search.toLowerCase());

    const matchCar = carFilter === "all" || lead.carInterest === carFilter;
    const matchStatus = statusFilter === "all" || (lead.status || "new") === statusFilter;

    return matchSearch && matchCar && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* KPI Stats Header */}
      <LeadStatsCards leads={initialLeads} />

      {/* Toolbar: Search, Filters, View Switcher & Export */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-y border-slate-800 py-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, xe..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={carFilter}
            onChange={(e) => setCarFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tất cả Dòng xe</option>
            {cars.map((car) => (
              <option key={car} value={car}>
                {car}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="new">🆕 Mới tiếp nhận</option>
            <option value="contacted">📞 Đã liên hệ</option>
            <option value="test_drive">🚗 Lịch hẹn lái thử</option>
            <option value="negotiating">💬 Báo giá / Thương lượng</option>
            <option value="won">🎉 Thành công</option>
            <option value="lost">❌ Thất bại / Hủy</option>
          </select>
        </div>

        {/* View Switcher & CSV Export */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Bảng Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Danh sách</span>
            </button>
          </div>

          <a
            href="/api/admin/leads/export"
            download
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Xuất Excel/CSV</span>
          </a>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "kanban" ? (
        <LeadKanban leads={filteredLeads} onSelectLead={(lead) => setSelectedLead(lead)} />
      ) : (
        <LeadTable
          leads={filteredLeads}
          onSelectLead={(lead) => setSelectedLead(lead)}
          userRole={userRole}
        />
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        userRole={userRole}
      />
    </div>
  );
}
