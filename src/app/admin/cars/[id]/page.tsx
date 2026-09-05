import "server-only";
import { getCrmCarBySlugOrId } from "@/lib/crm-db";
import { Upload, CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Car Information — CarEmpire CRM",
};

export default async function AdminCarInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCrmCarBySlugOrId(id);

  if (!car) {
    notFound();
  }

  const documents = [
    "Hợp đồng mua bán xe điện VinFast chính hãng",
    "Phiếu kiểm định chất lượng xuất xưởng (Cục Đăng Kiểm)",
    "Hồ sơ làm thủ tục Đăng ký & Biển số xe tại Đà Nẵng",
    "Bảo hiểm vật chất & Bảo dưỡng định kỳ",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listing"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Chi tiết Xe từ MongoDB CSDL</h1>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu thời gian thực được truy vấn từ MongoDB database</p>
          </div>
        </div>
      </div>

      {/* Main Car Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
        {/* Left: Car Image Hero */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">{car.name}</h2>
            <span className="text-xs font-semibold text-blue-400">{car.category || "VinFast Electric Vehicle"}</span>
          </div>

          <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80">
            <img
              src={car.heroImage || car.thumbnail || "/uploads/vf8.jpg"}
              alt={car.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px]">
              Hồ sơ & Thủ tục Cần thiết (Documents Needed)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Hồ sơ Khách hàng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Technical Specs & Pricing */}
        <div className="flex flex-col justify-between space-y-6 border-l border-slate-800/80 pl-0 lg:pl-8">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Giá niêm yết đại lý</span>
              <p className="text-3xl font-extrabold text-blue-400 mt-1">
                {car.price ? `${car.price.toLocaleString("vi-VN")} ₫` : "Liên hệ báo giá"}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Thông số Kỹ thuật & Khuyến mãi DB</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400">Tầm di chuyển (NEDC):</span>
                  <p className="font-medium text-slate-200">{car.nedc || "450 km/lần sạc"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Phiên bản:</span>
                  <p className="font-medium text-slate-200">
                    {car.versions ? car.versions.map((v) => `${v.name} (${v.price.toLocaleString("vi-VN")}đ)`).join(", ") : "Tiêu chuẩn"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Chương trình Khuyến mãi DB:</span>
                  <p className="font-medium text-emerald-400">
                    {car.promotions && car.promotions.length > 0
                      ? car.promotions.map((p) => p.name).join(", ")
                      : "Ưu đãi 100% lệ phí trước bạ ô tô điện"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-sm text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all">
            <ShoppingBag className="h-4 w-4" />
            <span>TẠO HỢP ĐỒNG ĐẶT CỌC</span>
          </button>
        </div>
      </div>
    </div>
  );
}
