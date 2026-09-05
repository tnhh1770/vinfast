import "server-only";
import { getCrmCars } from "@/lib/crm-db";
import { Filter, Download, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Listing — CarEmpire CRM",
};

export default async function AdminListingPage() {
  const cars = await getCrmCars();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Listing Xe Trong Kho MongoDB</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400 font-semibold">{cars.length} dòng xe</strong> sẵn sàng kinh doanh từ CSDL MongoDB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/cars"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Cars JSON ↓</span>
          </a>
        </div>
      </div>

      {/* Grid of Real Cars from MongoDB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.slug || String(car._id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div>
              {/* Car Title Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 font-bold text-xs text-blue-400">
                  {car.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{car.name}</h4>
                  <p className="text-[11px] text-slate-400">{car.category || "D-SUV Electric"}</p>
                </div>
              </div>

              {/* Specs Badges */}
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span className="rounded-md bg-slate-950 px-2 py-0.5 font-mono border border-slate-800">
                  ⚡ {car.nedc || "450 km/sạc"}
                </span>
                <span className="rounded-md bg-blue-950 px-2 py-0.5 font-semibold text-blue-300 border border-blue-800/40">
                  Đà Nẵng Showroom
                </span>
              </div>

              {/* Car Photo */}
              <div className="my-4 flex h-32 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60">
                <img
                  src={car.thumbnail || car.heroImage || "/uploads/vf8.jpg"}
                  alt={car.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Price & View Action */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-xs text-slate-400 block">Giá niêm yết</span>
                <span className="text-base font-bold text-emerald-400">
                  {car.price ? `${car.price.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                </span>
              </div>
              <Link
                href={`/admin/cars/${car.slug}/`}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
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
