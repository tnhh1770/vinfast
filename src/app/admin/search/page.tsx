import "server-only";
import { getCrmCars } from "@/lib/crm-db";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Search — CarEmpire CRM",
};

export default async function AdminSearchPage() {
  const cars = await getCrmCars();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tìm Kiếm Nâng Cao (MongoDB Database)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tìm kiếm xe, khách hàng và giao dịch trong CSDL MongoDB</p>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Phân loại Xe
            </label>
            <select className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white">
              <option>Tất cả các dòng xe</option>
              <option>D-SUV Electric</option>
              <option>MPV 7 Chỗ</option>
              <option>MiniCar</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Thương hiệu
            </label>
            <select className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white">
              <option>VinFast Việt Nam</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Từ khóa tìm kiếm
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                defaultValue="VinFast VF 8"
                placeholder="Nhập tên xe, mã hợp đồng..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Tìm thấy {cars.length} Dòng xe trong CSDL</h2>
      </div>

      {/* Search Grid Cards from MongoDB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.slug || String(car._id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                    {car.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{car.category || "VinFast EV"}</p>
                </div>
                <span className="rounded-md bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800/40">
                  {car.group || "VinFast"}
                </span>
              </div>

              <div className="my-4 flex h-32 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60">
                <img
                  src={car.thumbnail || car.heroImage || "/uploads/vf8.jpg"}
                  alt={car.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="text-base font-bold text-emerald-400">
                {car.price ? `${car.price.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
              </span>
              <Link
                href={`/admin/cars/${car.slug}/`}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <span>Chi tiết</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
