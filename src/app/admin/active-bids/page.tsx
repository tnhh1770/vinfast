import "server-only";
import { getCrmBids } from "@/lib/crm-db";
import { Filter, Gavel } from "lucide-react";

export const metadata = {
  title: "Active Bids — CarEmpire CRM",
};

export default async function AdminActiveBidsPage() {
  const bids = await getCrmBids();

  const colors = [
    { name: "Light Green", bg: "bg-emerald-500" },
    { name: "Lavender", bg: "bg-purple-500" },
    { name: "Orange", bg: "bg-amber-500" },
    { name: "Rose Red", bg: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Bids / Sàn Báo Giá Đấu Giá (MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400 font-semibold">{bids.length} xe đang mở báo giá</strong> từ CSDL database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-blue-400 bg-blue-950 border border-blue-800/40 px-3 py-1.5 rounded-xl">
            {bids.length} Xe đang đấu giá
          </span>
        </div>
      </div>

      {/* Main Grid: Filter Sidebar & Auction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <span>Bộ Lọc Đấu Giá DB</span>
            </h3>
          </div>

          {/* Color Selection Filter */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Màu sắc xe</span>
            <div className="space-y-1.5">
              {colors.map((c) => (
                <label key={c.name} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <div className={`h-3 w-3 rounded-full ${c.bg}`} />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Active Bids Cards from MongoDB */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {bids.map((bid) => (
            <div
              key={bid._id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {bid.carName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{bid.location || "Đà Nẵng"}</p>
                  </div>
                  <span className="rounded-md bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800/40">
                    {bid.style || "VF Electric"}
                  </span>
                </div>

                <div className="my-4 flex h-32 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60">
                  <img
                    src={bid.image || "/uploads/vf8.jpg"}
                    alt={bid.carName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Price & Bid Now Button */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">Mức giá hiện tại</span>
                  <span className="text-base font-bold text-emerald-400">
                    {bid.currentBid ? `${bid.currentBid.toLocaleString("vi-VN")} ₫` : "Khởi điểm"}
                  </span>
                </div>

                <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all">
                  <Gavel className="h-3.5 w-3.5" />
                  <span>Bid Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
