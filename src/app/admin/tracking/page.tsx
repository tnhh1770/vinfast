import "server-only";
import { getCrmTrackings } from "@/lib/crm-db";
import { MapPin, Clock, Camera, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Tracking — CarEmpire CRM",
};

export default async function AdminTrackingPage() {
  const trackings = await getCrmTrackings();
  const currentTracking = trackings[0] || {
    carName: "VinFast VF 8 All New",
    customerName: "Nguyễn Văn Hùng",
    driverName: "Nguyễn Văn Tuấn",
    routeName: "Showroom Đà Nẵng → Hòa Khánh",
    locationAddress: "Đường Nguyễn Lương Bằng, Đà Nẵng",
    timeLeftMin: 35,
    carImage: "/uploads/2026/05/vinhxdcom_vf_8_the_he_moi.webp",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tracking Vận Chuyển Xe Live (MongoDB)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400">{trackings.length} xe đang được theo dõi</strong> trực tuyến từ CSDL
          </p>
        </div>
      </div>

      {/* Tracking Layout from MongoDB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Car Tracking List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm space-y-3">
          <h3 className="font-bold text-sm text-white mb-2">Danh sách Xe Đang Vận Chuyển</h3>
          <div className="space-y-2">
            {trackings.map((track, i) => (
              <div
                key={track._id || i}
                className={`flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer ${
                  i === 0
                    ? "border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10"
                    : "border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40"
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{track.carName}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{track.locationAddress || "Đang giao xe"}</p>
                </div>
                <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                  {track.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Live Route Tracking Map & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
            {/* Header: Car Title & Time Left */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">{currentTracking.carName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{currentTracking.locationAddress}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 font-mono">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Còn {currentTracking.timeLeftMin} phút</span>
                </div>

                <button className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Cập nhật Lộ trình</span>
                </button>
              </div>
            </div>

            {/* Simulated Live GPS Map Graphic */}
            <div className="relative h-64 w-full rounded-xl bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-blue-400 font-bold">
                  <MapPin className="h-4 w-4" /> Point A (Showroom Đà Nẵng)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <MapPin className="h-4 w-4" /> Point B (Khách hàng)
                </span>
              </div>

              {/* Vehicle Center Render */}
              <div className="relative z-10 mx-auto flex h-28 w-48 items-center justify-center rounded-xl bg-slate-900/90 border border-blue-500/40 p-2 shadow-2xl">
                <img
                  src={currentTracking.carImage || "/uploads/vf8.jpg"}
                  alt="Car"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="relative z-10 flex justify-between text-xs text-slate-400">
                <span>Nguyễn Văn Linh</span>
                <span>Tôn Đức Thắng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
