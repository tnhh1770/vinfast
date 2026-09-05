"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, Loader2, ArrowUpRight, Phone, Briefcase, CreditCard, Car } from "lucide-react";
import type { Car as CarType, Lead } from "@/types";
import type { IDeal } from "@/lib/models/Deal";
import type { ITransaction } from "@/lib/models/Transaction";
import { DEAL_STATUS, TRANSACTION_STATUS, labelOf } from "@/lib/crm-labels";

type Scope = "all" | "cars" | "leads" | "deals" | "transactions";

interface SearchResponse {
  success: boolean;
  totalFound: number;
  categories: string[];
  data: {
    cars: CarType[];
    leads: Lead[];
    deals: IDeal[];
    transactions: ITransaction[];
  };
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "cars", label: "Xe" },
  { value: "leads", label: "Khách hàng" },
  { value: "deals", label: "Hợp đồng" },
  { value: "transactions", label: "Giao dịch" },
];

const money = (n?: number) => (n ? `${n.toLocaleString("vi-VN")} ₫` : "Liên hệ");

export default function SearchClient({ initialCategories }: { initialCategories: string[] }) {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Huỷ request cũ khi người dùng gõ tiếp để kết quả không về sai thứ tự.
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ scope });
    if (q.trim()) params.set("q", q.trim());
    if (category !== "all") params.set("category", category);
    if (maxPrice) params.set("maxPrice", maxPrice);

    try {
      const res = await fetch(`/api/admin/search/?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = (await res.json()) as SearchResponse & { message?: string };
      if (!data.success) {
        setError(data.message || "Tìm kiếm thất bại.");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Lỗi kết nối máy chủ.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [q, scope, category, maxPrice]);

  // Gõ xong 350ms mới gọi API.
  useEffect(() => {
    const timer = setTimeout(runSearch, 350);
    return () => clearTimeout(timer);
  }, [runSearch]);

  const categories = useMemo(
    () => (result?.categories?.length ? result.categories : initialCategories),
    [result, initialCategories],
  );

  const d = result?.data;
  const isEmpty = result && result.totalFound === 0;

  return (
    <div className="space-y-6">
      {/* Bộ lọc */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="crm-search-q"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Từ khoá
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="crm-search-q"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tên xe, số điện thoại khách, mã hợp đồng…"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="crm-search-category"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Phân khúc xe
            </label>
            <select
              id="crm-search-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả phân khúc</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="crm-search-max"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Giá tối đa (₫)
            </label>
            <input
              id="crm-search-max"
              type="number"
              min={0}
              step={10000000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="vd: 800000000"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                scope === s.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trạng thái */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
          <span>
            {result ? `Tìm thấy ${result.totalFound} kết quả` : "Đang tải kết quả…"}
          </span>
        </h2>
        {q.trim() === "" && scope !== "cars" && scope !== "all" && (
          <span className="text-xs text-slate-500">Nhập từ khoá để tìm khách hàng / hợp đồng</span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {isEmpty && !error && (
        <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-sm text-slate-500">
          Không có bản ghi nào khớp với điều kiện tìm kiếm.
        </div>
      )}

      {/* Xe */}
      {d && d.cars.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Car className="h-4 w-4 text-blue-400" /> Xe ({d.cars.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {d.cars.map((car) => (
              <div
                key={car.slug}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:border-blue-500/50"
              >
                <h4 className="font-bold text-white">{car.name}</h4>
                <p className="mt-0.5 text-xs text-slate-400">{car.category || "Xe điện"}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-sm font-bold text-emerald-400">{money(car.price)}</span>
                  <Link
                    href={`/admin/cars/${car.slug}/`}
                    className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    Chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Khách hàng */}
      {d && d.leads.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Phone className="h-4 w-4 text-purple-400" /> Khách hàng ({d.leads.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <tbody className="divide-y divide-slate-800/80">
                {d.leads.map((lead) => (
                  <tr key={String(lead._id)} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-white">{lead.name}</td>
                    <td className="px-4 py-3 font-mono">{lead.phone}</td>
                    <td className="px-4 py-3 text-blue-300">{lead.carInterest || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{lead.source}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href="/admin/leads/" className="text-blue-400 hover:underline">
                        Mở CRM →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Hợp đồng */}
      {d && d.deals.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Briefcase className="h-4 w-4 text-emerald-400" /> Hợp đồng ({d.deals.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <tbody className="divide-y divide-slate-800/80">
                {d.deals.map((deal) => (
                  <tr key={String(deal._id)} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-blue-300">{deal.dealId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{deal.ownerName}</td>
                    <td className="px-4 py-3">{deal.carType}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">{money(deal.totalPrice)}</td>
                    <td className="px-4 py-3 text-slate-400">{labelOf(DEAL_STATUS, deal.status).label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Giao dịch */}
      {d && d.transactions.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <CreditCard className="h-4 w-4 text-amber-400" /> Giao dịch ({d.transactions.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <tbody className="divide-y divide-slate-800/80">
                {d.transactions.map((tx) => (
                  <tr key={String(tx._id)} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-blue-300">{tx.transactionId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{tx.ownerName}</td>
                    <td className="px-4 py-3">{tx.carType}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">{money(tx.totalMoney)}</td>
                    <td className="px-4 py-3 text-slate-400">{labelOf(TRANSACTION_STATUS, tx.status).label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
