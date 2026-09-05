"use client";

import { Phone, MessageCircle, Clock, ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import type { Lead, LeadStatus } from "@/types";
import { updateLeadStatusAction } from "@/app/actions/crm";
import { toast } from "sonner";

interface LeadKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const COLUMNS: { status: LeadStatus; title: string; color: string; badgeBg: string }[] = [
  { status: "new", title: "Mới Tiếp Nhận", color: "border-blue-500", badgeBg: "bg-blue-500/20 text-blue-300" },
  { status: "contacted", title: "Đã Liên Hệ", color: "border-purple-500", badgeBg: "bg-purple-500/20 text-purple-300" },
  { status: "test_drive", title: "Hẹn Lái Thử", color: "border-amber-500", badgeBg: "bg-amber-500/20 text-amber-300" },
  { status: "negotiating", title: "Báo Giá / Thảo Luận", color: "border-cyan-500", badgeBg: "bg-cyan-500/20 text-cyan-300" },
  { status: "won", title: "Thành Công (Chốt Đơn)", color: "border-emerald-500", badgeBg: "bg-emerald-500/20 text-emerald-300" },
  { status: "lost", title: "Thất Bại / Hủy", color: "border-rose-500", badgeBg: "bg-rose-500/20 text-rose-300" },
];

export function LeadKanban({ leads, onSelectLead }: LeadKanbanProps) {
  async function handleMove(leadId: string, currentStatus: LeadStatus, direction: "next" | "prev") {
    const order: LeadStatus[] = ["new", "contacted", "test_drive", "negotiating", "won", "lost"];
    const idx = order.indexOf(currentStatus);
    if (idx === -1) return;

    const nextIdx = direction === "next" ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= order.length) return;

    const nextStatus = order[nextIdx];
    try {
      await updateLeadStatusAction(leadId, nextStatus);
      toast.success("Đã di chuyển trạng thái Lead");
    } catch {
      toast.error("Di chuyển thất bại");
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => (l.status || "new") === col.status);

        return (
          <div
            key={col.status}
            className="flex h-[calc(100vh-250px)] min-w-[280px] w-72 flex-col rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between border-t-4 ${col.color} border-b border-slate-800 p-3.5`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-200">{col.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.badgeBg}`}>
                  {columnLeads.length}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {columnLeads.map((lead) => (
                <div
                  key={lead._id || lead.phone + lead.createdAt}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 shadow-md transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Card Header: Name & Priority */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                        {lead.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{lead.phone}</p>
                    </div>
                    {lead.priority && lead.priority !== "medium" && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          lead.priority === "urgent"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : lead.priority === "high"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {lead.priority === "urgent" ? "Khẩn cấp" : "Ưu tiên cao"}
                      </span>
                    )}
                  </div>

                  {/* Car Interest Badge */}
                  {lead.carInterest && (
                    <div className="mt-2.5">
                      <span className="inline-block rounded-md bg-blue-950/80 px-2 py-1 text-[11px] font-semibold text-blue-300 border border-blue-800/40">
                        🚗 {lead.carInterest}
                      </span>
                    </div>
                  )}

                  {/* Quick Action Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
                    <span className="text-[10px]">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("vi-VN") : "Mới"}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {col.status !== "new" && (
                        <button
                          onClick={() => lead._id && handleMove(lead._id, col.status, "prev")}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Lùi trạng thái"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      {col.status !== "lost" && (
                        <button
                          onClick={() => lead._id && handleMove(lead._id, col.status, "next")}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Tiến trạng thái"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
                  Chưa có Lead
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
