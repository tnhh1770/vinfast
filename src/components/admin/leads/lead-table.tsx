"use client";

import { Phone, MessageCircle, ExternalLink, Eye, Trash2 } from "lucide-react";
import type { Lead, LeadStatus } from "@/types";
import { updateLeadStatusAction, deleteLeadAction } from "@/app/actions/crm";
import { toast } from "sonner";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  userRole?: string;
}

export function LeadTable({ leads, onSelectLead, userRole }: LeadTableProps) {
  async function handleStatusChange(leadId: string, status: LeadStatus) {
    try {
      await updateLeadStatusAction(leadId, status);
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  }

  async function handleDelete(leadId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa lead này?")) return;
    try {
      await deleteLeadAction(leadId);
      toast.success("Đã xóa Lead");
    } catch {
      toast.error("Xóa thất bại");
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          <tr>
            <th className="px-4 py-3.5">Khách hàng</th>
            <th className="px-4 py-3.5">Số Điện thoại</th>
            <th className="px-4 py-3.5">Xe quan tâm</th>
            <th className="px-4 py-3.5">Trạng thái Phễu</th>
            <th className="px-4 py-3.5">Ưu tiên</th>
            <th className="px-4 py-3.5">Nguồn</th>
            <th className="px-4 py-3.5">Ngày gửi</th>
            <th className="px-4 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {leads.map((lead) => {
            const phoneClean = lead.phone ? lead.phone.replace(/\D/g, "") : "";
            const zaloUrl = phoneClean ? `https://zalo.me/${phoneClean}` : "#";

            return (
              <tr
                key={lead._id || lead.phone + lead.createdAt}
                className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                onClick={() => onSelectLead(lead)}
              >
                <td className="px-4 py-3 font-semibold text-white group-hover:text-blue-400">
                  {lead.name}
                </td>

                <td className="px-4 py-3 font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>{lead.phone}</span>
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded p-1 text-emerald-400 hover:bg-emerald-500/20"
                      title="Gọi điện"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded p-1 text-blue-400 hover:bg-blue-500/20"
                      title="Chat Zalo"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>

                <td className="px-4 py-3 font-medium text-blue-300">
                  {lead.carInterest || "Tất cả các xe"}
                </td>

                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status || "new"}
                    onChange={(e) => lead._id && handleStatusChange(lead._id, e.target.value as LeadStatus)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="new">🆕 Mới</option>
                    <option value="contacted">📞 Đã liên hệ</option>
                    <option value="test_drive">🚗 Lịch hẹn lái thử</option>
                    <option value="negotiating">💬 Báo giá</option>
                    <option value="won">🎉 Thành công</option>
                    <option value="lost">❌ Thất bại</option>
                  </select>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      lead.priority === "urgent"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : lead.priority === "high"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {lead.priority === "urgent"
                      ? "Khẩn cấp"
                      : lead.priority === "high"
                      ? "Cao"
                      : "Thường"}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-400">{lead.source || "Website"}</td>

                <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("vi-VN") : "Mới"}
                </td>

                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                      Chi tiết
                    </button>
                    {userRole === "admin" && lead._id && (
                      <button
                        onClick={() => handleDelete(lead._id!)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {leads.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                Không tìm thấy khách hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
