import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import DealModel from "@/lib/models/Deal";
import BidModel from "@/lib/models/Bid";
import TransactionModel from "@/lib/models/Transaction";
import CalendarEventModel from "@/lib/models/CalendarEvent";
import TrackingModel from "@/lib/models/Tracking";
import LeadModel from "@/lib/models/Lead";
import type { LeadStatus } from "@/types";

const MONTH_WINDOW = 9;

/** `05/09/2026` (dd/mm/yyyy) -> Date. Trả null nếu không parse được. */
function parseVnDate(value?: string | null): Date | null {
  if (!value) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Ưu tiên ngày nghiệp vụ do người dùng nhập, thiếu thì lấy timestamp của bản ghi. */
function effectiveDate(businessDate?: string | null, createdAt?: Date | string | null): Date | null {
  return parseVnDate(businessDate) ?? (createdAt ? new Date(createdAt) : null);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Danh sách N tháng gần nhất, cũ -> mới. */
function recentMonths(count = MONTH_WINDOW) {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKey(d), label: `T${d.getMonth() + 1}` });
  }
  return out;
}

export interface CrmOverview {
  counts: {
    cars: number;
    leads: number;
    deals: number;
    activeBids: number;
    transactions: number;
    upcomingEvents: number;
    activeDeliveries: number;
  };
  revenue: {
    paid: number;
    pending: number;
    dealPipeline: number;
  };
  leadsByStatus: Record<LeadStatus, number>;
  conversionRate: number;
  newLeads7Days: number;
}

export async function getCrmOverview(): Promise<CrmOverview> {
  const empty: CrmOverview = {
    counts: {
      cars: 0,
      leads: 0,
      deals: 0,
      activeBids: 0,
      transactions: 0,
      upcomingEvents: 0,
      activeDeliveries: 0,
    },
    revenue: { paid: 0, pending: 0, dealPipeline: 0 },
    leadsByStatus: { new: 0, contacted: 0, test_drive: 0, negotiating: 0, won: 0, lost: 0 },
    conversionRate: 0,
    newLeads7Days: 0,
  };

  const conn = await connectToDatabase();
  if (!conn) return empty;

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    cars,
    leadsTotal,
    dealsTotal,
    activeBids,
    transactionsTotal,
    upcomingEvents,
    activeDeliveries,
    newLeads7Days,
    leadStatusAgg,
    txAgg,
    dealAgg,
  ] = await Promise.all([
    CarModel.countDocuments({}),
    LeadModel.countDocuments({}),
    DealModel.countDocuments({}),
    BidModel.countDocuments({ status: "Active" }),
    TransactionModel.countDocuments({}),
    CalendarEventModel.countDocuments({ date: { $gte: today } }),
    TrackingModel.countDocuments({ status: { $ne: "Delivered" } }),
    LeadModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    LeadModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: { $ifNull: ["$status", "new"] }, count: { $sum: 1 } } },
    ]),
    TransactionModel.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$status", total: { $sum: "$totalMoney" } } },
    ]),
    DealModel.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$status", total: { $sum: "$totalPrice" } } },
    ]),
  ]);

  const leadsByStatus = { ...empty.leadsByStatus };
  for (const row of leadStatusAgg) {
    if (row._id in leadsByStatus) leadsByStatus[row._id as LeadStatus] = row.count;
  }

  const txByStatus = Object.fromEntries(txAgg.map((r) => [r._id, r.total]));
  const dealByStatus = Object.fromEntries(dealAgg.map((r) => [r._id, r.total]));

  const closed = leadsByStatus.won + leadsByStatus.lost;

  return {
    counts: {
      cars,
      leads: leadsTotal,
      deals: dealsTotal,
      activeBids,
      transactions: transactionsTotal,
      upcomingEvents,
      activeDeliveries,
    },
    revenue: {
      paid: txByStatus.Paid ?? 0,
      pending: txByStatus.Pending ?? 0,
      // Hợp đồng đã ký / hoàn tất = doanh thu đã chốt trên pipeline.
      dealPipeline: (dealByStatus.Signed ?? 0) + (dealByStatus.Completed ?? 0),
    },
    leadsByStatus,
    conversionRate: closed > 0 ? Math.round((leadsByStatus.won / closed) * 100) : 0,
    newLeads7Days,
  };
}

export interface CrmAnalytics {
  months: { month: string; leads: number; won: number; revenue: number }[];
  carsByCategory: { name: string; count: number }[];
  leadsBySource: { name: string; count: number }[];
  topCarInterest: { name: string; count: number }[];
  maxLeads: number;
  maxRevenue: number;
}

export async function getCrmAnalytics(): Promise<CrmAnalytics> {
  const months = recentMonths();
  const empty: CrmAnalytics = {
    months: months.map((m) => ({ month: m.label, leads: 0, won: 0, revenue: 0 })),
    carsByCategory: [],
    leadsBySource: [],
    topCarInterest: [],
    maxLeads: 0,
    maxRevenue: 0,
  };

  const conn = await connectToDatabase();
  if (!conn) return empty;

  const [leads, transactions, cars] = await Promise.all([
    LeadModel.find({}).select("status source carInterest createdAt").lean(),
    TransactionModel.find({}).select("status totalMoney creationDate createdAt").lean(),
    CarModel.find({}).select("category group").lean(),
  ]);

  const byMonth = new Map(months.map((m) => [m.key, { month: m.label, leads: 0, won: 0, revenue: 0 }]));

  for (const lead of leads) {
    const d = lead.createdAt ? new Date(lead.createdAt) : null;
    if (!d) continue;
    const bucket = byMonth.get(monthKey(d));
    if (!bucket) continue;
    bucket.leads += 1;
    if (lead.status === "won") bucket.won += 1;
  }

  for (const tx of transactions) {
    if (tx.status !== "Paid") continue;
    const d = effectiveDate(tx.creationDate, tx.createdAt);
    if (!d) continue;
    const bucket = byMonth.get(monthKey(d));
    if (!bucket) continue;
    bucket.revenue += tx.totalMoney || 0;
  }

  const tally = (values: (string | undefined | null)[]) => {
    const counts = new Map<string, number>();
    for (const raw of values) {
      const key = (raw || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const series = [...byMonth.values()];

  return {
    months: series,
    carsByCategory: tally(cars.map((c) => c.category || c.group)),
    leadsBySource: tally(leads.map((l) => l.source)).slice(0, 6),
    topCarInterest: tally(leads.map((l) => l.carInterest)).slice(0, 6),
    maxLeads: Math.max(1, ...series.map((m) => m.leads)),
    maxRevenue: Math.max(1, ...series.map((m) => m.revenue)),
  };
}

export interface RecentActivity {
  id: string;
  kind: "Lead" | "Deal" | "Giao dịch";
  title: string;
  subtitle: string;
  amount: number | null;
  status: string;
  at: string | null;
}

/** Nhật ký hoạt động ghép từ lead + deal + giao dịch thật, mới nhất trước. */
export async function getRecentActivity(limit = 8): Promise<RecentActivity[]> {
  const conn = await connectToDatabase();
  if (!conn) return [];

  const [leads, deals, transactions] = await Promise.all([
    LeadModel.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
    DealModel.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
    TransactionModel.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
  ]);

  const rows: RecentActivity[] = [
    ...leads.map((l) => ({
      id: String(l._id),
      kind: "Lead" as const,
      title: l.name,
      subtitle: l.carInterest ? `Quan tâm ${l.carInterest}` : l.source || "Website",
      amount: null,
      status: l.status || "new",
      at: l.createdAt ? new Date(l.createdAt).toISOString() : null,
    })),
    ...deals.map((d) => ({
      id: String(d._id),
      kind: "Deal" as const,
      title: d.ownerName,
      subtitle: `${d.dealId} · ${d.carType}`,
      amount: d.totalPrice,
      status: d.status,
      at: (effectiveDate(d.creationDate, d.createdAt) ?? new Date(0)).toISOString(),
    })),
    ...transactions.map((t) => ({
      id: String(t._id),
      kind: "Giao dịch" as const,
      title: t.ownerName,
      subtitle: `${t.transactionId} · ${t.carType}`,
      amount: t.totalMoney,
      status: t.status,
      at: (effectiveDate(t.creationDate, t.createdAt) ?? new Date(0)).toISOString(),
    })),
  ];

  return rows
    .sort((a, b) => (b.at || "").localeCompare(a.at || ""))
    .slice(0, limit);
}
