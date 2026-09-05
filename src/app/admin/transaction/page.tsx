import "server-only";
import { getCrmTransactions } from "@/lib/crm-db";
import { Download } from "lucide-react";

export const metadata = {
  title: "Transaction — CarEmpire CRM",
};

export default async function AdminTransactionPage() {
  const transactions = await getCrmTransactions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Giao Dịch Tài Chính (MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-emerald-400 font-semibold">{transactions.length} giao dịch</strong> lưu trữ trong CSDL MongoDB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/transactions"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Transactions API ↓</span>
          </a>
        </div>
      </div>

      {/* Transaction List Table from MongoDB */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
          Lịch sử Thanh toán Realtime ({transactions.length} Giao dịch)
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Mã Giao Dịch</th>
              <th className="px-5 py-3.5">Khách Hàng / Chủ Xe</th>
              <th className="px-5 py-3.5">Ngày Tạo</th>
              <th className="px-5 py-3.5">Loại Xe VinFast</th>
              <th className="px-5 py-3.5">Phương Thức</th>
              <th className="px-5 py-3.5">Số Tiền Thanh Toán</th>
              <th className="px-5 py-3.5 text-right">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {transactions.map((tx) => (
              <tr key={tx.transactionId || String(tx._id)} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-mono text-slate-500">{tx.transactionId}</td>
                <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span>{tx.ownerName}</span>
                </td>
                <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{tx.creationDate}</td>
                <td className="px-5 py-4 font-medium text-blue-300">{tx.carType}</td>
                <td className="px-5 py-4 font-mono text-slate-300">{tx.paymentMethod}</td>
                <td className="px-5 py-4 font-bold text-emerald-400 text-sm">
                  {tx.totalMoney ? `${tx.totalMoney.toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span
                    className={`rounded-md px-3 py-1 text-[10px] font-bold ${
                      tx.status === "Paid"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                        : "bg-amber-950 text-amber-300 border border-amber-800/50"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
