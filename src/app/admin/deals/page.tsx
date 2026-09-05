import "server-only";
import { getCrmDeals } from "@/lib/crm-db";
import { Download } from "lucide-react";

export const metadata = {
  title: "Deals — CarEmpire CRM",
};

export default async function AdminDealsPage() {
  const deals = await getCrmDeals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deals (Hợp Đồng Giao Dịch MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-emerald-400 font-semibold">{deals.length} hợp đồng</strong> truy vấn trực tiếp từ CSDL database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/deals"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Deals API ↓</span>
          </a>
        </div>
      </div>

      {/* Real Deals List Table from MongoDB */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
          Deals List ({deals.length} Hợp đồng)
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Mã Hợp Đồng</th>
              <th className="px-5 py-3.5">Chủ Sở Hữu / Khách</th>
              <th className="px-5 py-3.5">Ngày Tạo</th>
              <th className="px-5 py-3.5">Loại Xe VinFast</th>
              <th className="px-5 py-3.5">Ngày Bàn Giao</th>
              <th className="px-5 py-3.5">Thanh Toán</th>
              <th className="px-5 py-3.5 text-right">Tổng Giá Trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {deals.map((deal) => (
              <tr key={deal.dealId || String(deal._id)} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-mono text-slate-500">{deal.dealId}</td>
                <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>{deal.ownerName}</span>
                </td>
                <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{deal.creationDate}</td>
                <td className="px-5 py-4 font-medium text-blue-300">{deal.carType}</td>
                <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{deal.returnDate}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    deal.paymentType === "Card" ? "bg-purple-950 text-purple-300 border border-purple-800/40" : "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                  }`}>
                    {deal.paymentType}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold text-emerald-400 text-sm">
                  {deal.totalPrice ? `${deal.totalPrice.toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
