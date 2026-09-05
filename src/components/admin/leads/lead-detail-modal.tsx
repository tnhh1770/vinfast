"use client";

import { useState } from "react";
import {
  X,
  Phone,
  MessageCircle,
  Clock,
  UserCheck,
  Send,
  Trash2,
  AlertCircle,
  Tag,
  Calendar,
  Compass,
} from "lucide-react";
import type { Lead, LeadStatus, LeadPriority } from "@/types";
import {
  updateLeadStatusAction,
  updateLeadPriorityAction,
  addLeadNoteAction,
  assignLeadAction,
  deleteLeadAction,
} from "@/app/actions/crm";
import { toast } from "sonner";

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  userRole?: string;
}

export function LeadDetailModal({ lead, onClose, userRole }: LeadDetailModalProps) {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const phoneClean = lead.phone ? lead.phone.replace(/\D/g, "") : "";
  const zaloUrl = phoneClean ? `https://zalo.me/${phoneClean}` : "#";

  async function handleStatusChange(status: LeadStatus) {
    if (!lead?._id) return;
    setLoading(true);
    try {
      await updateLeadStatusAction(lead._id, status);
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handlePriorityChange(priority: LeadPriority) {
    if (!lead?._id) return;
    setLoading(true);
    try {
      await updateLeadPriorityAction(lead._id, priority);
      toast.success("Đã cập nhật mức ưu tiên");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!lead?._id || !newNote.trim()) return;
    setLoading(true);
    try {
      await addLeadNoteAction(lead._id, newNote);
      setNewNote("");
      toast.success("Đã thêm ghi chú mới");
    } catch {
      toast.error("Thêm ghi chú thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(assignedTo: string) {
    if (!lead?._id) return;
    setLoading(true);
    try {
      await assignLeadAction(lead._id, assignedTo);
      toast.success(`Đã gán cho Sales ${assignedTo}`);
    } catch {
      toast.error("Gán Sales thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!lead?._id || !confirm("Bạn có chắc chắn muốn xóa lead này không?")) return;
    setLoading(true);
    try {
      await deleteLeadAction(lead._id);
      toast.success("Đã xóa Lead");
      onClose();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 font-bold text-blue-400">
              {lead.name ? lead.name.charAt(0).toUpperCase() : "K"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{lead.name || "Khách hàng mới"}</h2>
              <p className="text-xs text-slate-400">
                Tạo lúc: {lead.createdAt ? new Date(lead.createdAt).toLocaleString("vi-VN") : "Mới"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === "admin" && (
              <button
                onClick={handleDelete}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                title="Xóa Lead"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Bar: Call & Zalo */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>Gọi ngay: {lead.phone}</span>
            </a>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Mở Zalo Chat</span>
            </a>
          </div>

          {/* Info Card */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
            <div>
              <span className="text-slate-400">Dòng xe quan tâm:</span>
              <p className="mt-1 font-semibold text-blue-400 text-sm">{lead.carInterest || "Tất cả các dòng xe"}</p>
            </div>
            <div>
              <span className="text-slate-400">Nguồn Lead:</span>
              <p className="mt-1 font-medium text-slate-200">{lead.source || "Website"}</p>
            </div>
            <div>
              <span className="text-slate-400">Đường dẫn trang gửi:</span>
              <p className="mt-1 font-mono text-slate-400 truncate">{lead.path || "/"}</p>
            </div>
            <div>
              <span className="text-slate-400">Ghi chú ban đầu từ form:</span>
              <p className="mt-1 text-slate-300 italic">{lead.message || "(Không có)"}</p>
            </div>
          </div>

          {/* Controls: Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trạng thái Phễu CRM:
              </label>
              <select
                value={lead.status || "new"}
                disabled={loading}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="new">🆕 Mới tiếp nhận</option>
                <option value="contacted">📞 Đã liên hệ gọi điện</option>
                <option value="test_drive">🚗 Lịch hẹn lái thử</option>
                <option value="negotiating">💬 Báo giá / Thương lượng</option>
                <option value="won">🎉 Thành công (Chốt đơn)</option>
                <option value="lost">❌ Thất bại / Hủy nhu cầu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mức độ Ưu tiên:
              </label>
              <select
                value={lead.priority || "medium"}
                disabled={loading}
                onChange={(e) => handlePriorityChange(e.target.value as LeadPriority)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">🟡 Thấp</option>
                <option value="medium">🔵 Trung bình</option>
                <option value="high">🟠 Cao (Rất quan tâm)</option>
                <option value="urgent">🔴 Khẩn cấp (Cần chọc ngay)</option>
              </select>
            </div>
          </div>

          {/* Activity Notes Timeline */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>Lịch sử chăm sóc & Ghi chú (Activity Timeline)</span>
            </h3>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nhập ghi chú cuộc gọi, lịch hẹn..."
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !newNote.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ghi chú</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes
                  .slice()
                  .reverse()
                  .map((note, i) => (
                    <div key={i} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-blue-400">{note.author || "Admin"}</span>
                        <span>{note.createdAt ? new Date(note.createdAt).toLocaleString("vi-VN") : ""}</span>
                      </div>
                      <p className="mt-1 text-slate-200 leading-relaxed">{note.content}</p>
                    </div>
                  ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-500">Chưa có ghi chú chăm sóc nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
