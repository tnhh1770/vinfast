"use client";

import { Users, UserPlus, Car, CheckCircle2, TrendingUp } from "lucide-react";
import type { Lead } from "@/types";

interface LeadStatsCardsProps {
  leads: Lead[];
}

export function LeadStatsCards({ leads }: LeadStatsCardsProps) {
  const totalLeads = leads.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const newToday = leads.filter((l) => {
    if (!l.createdAt) return false;
    const d = typeof l.createdAt === "string" ? l.createdAt : l.createdAt.toISOString();
    return d.slice(0, 10) === todayStr;
  }).length;

  const testDrives = leads.filter((l) => l.status === "test_drive").length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";

  const cards = [
    {
      title: "Tổng Khách hàng (Leads)",
      value: totalLeads,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Lead mới Hôm nay",
      value: newToday,
      icon: UserPlus,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Lịch hẹn Lái thử",
      value: testDrives,
      icon: Car,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Chốt đơn Thành công",
      value: wonLeads,
      icon: CheckCircle2,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-xl border ${card.borderColor} bg-slate-900/60 p-4 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`rounded-lg p-2 ${card.bgColor} ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-100">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
