"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, ShoppingBag, ArrowLeft, Edit3, Trash2, X, AlertTriangle } from "lucide-react";
import type { Car } from "@/types";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface CarDetailClientProps {
  initialCar: Car;
}

export default function CarDetailClient({ initialCar }: CarDetailClientProps) {
  const router = useRouter();
  const [car, setCar] = useState<Car>(initialCar);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: car.name || "",
    category: car.category || "",
    price: car.price || 0,
    nedc: car.nedc || "",
    heroImage: car.heroImage || car.thumbnail || "/uploads/vf8.jpg",
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    notify(null);

    const carId = car.slug || car._id;

    try {
      const res = await adminFetch(`/api/admin/cars/${carId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setCar(data.data);
        setIsEditOpen(false);
        notify({ type: "success", text: "Đã cập nhật thông tin xe thành công trong MongoDB!" });
      } else {
        notify({ type: "error", text: data.message || "Cập nhật thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    notify(null);

    const carId = car.slug || car._id;

    try {
      const res = await adminFetch(`/api/admin/cars/${carId}/`, {
        method: "DELETE",
      });
      const data = await readJson(res);

      if (data.success) {
        router.push("/admin/listing");
      } else {
        notify({ type: "error", text: data.message || "Xóa xe thất bại." });
        setIsDeleteOpen(false);
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ khi xóa xe." });
      setIsDeleteOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/deals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carName: car.name,
          clientName: "Khách hàng Nguyễn Văn A",
          clientPhone: "0905123456",
          amount: car.price,
          stage: "Won",
          salesman: "Trần Văn B (Đà Nẵng)",
        }),
      });
      const data = await readJson(res);
      if (data.success) {
        notify({ type: "success", text: `Đã tạo hợp đồng đặt cọc cho dòng xe ${car.name} thành công!` });
      }
    } catch {
      notify({ type: "error", text: "Tạo hợp đồng thất bại." });
    } finally {
      setLoading(false);
    }
  };

  const documents = [
    "Hợp đồng mua bán xe điện VinFast chính hãng",
    "Phiếu kiểm định chất lượng xuất xưởng (Cục Đăng Kiểm)",
    "Hồ sơ làm thủ tục Đăng ký & Biển số xe tại Đà Nẵng",
    "Bảo hiểm vật chất & Bảo dưỡng định kỳ",
  ];

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {/* Header with Navigation & Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listing"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Chi tiết xe: {car.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu thời gian thực truy vấn trực tiếp từ CSDL MongoDB</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Chỉnh Sửa Xe</span>
          </button>

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa Xe</span>
          </button>
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

          <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước trong CRM, không ảnh hưởng LCP trang public */}
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
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">
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
                    {car.versions && car.versions.length > 0
                      ? car.versions.map((v) => `${v.name} (${v.price.toLocaleString("vi-VN")}đ)`).join(", ")
                      : "Tiêu chuẩn"}
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

          <button
            onClick={createDeal}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-sm text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>TẠO HỢP ĐỒNG ĐẶT CỌC SEED MONGO</span>
          </button>
        </div>
      </div>

      {/* Edit Car Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-400" />
                <span>Cập Nhật Thông Tin Xe</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Dòng Xe</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phân Khúc</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá Bán (VND)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">NEDC (Tầm Vận Hành)</label>
                <input
                  type="text"
                  value={editForm.nedc}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nedc: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Hình Ảnh</label>
                <input
                  type="text"
                  value={editForm.heroImage}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, heroImage: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Car Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Xe &quot;{car.name}&quot;?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa dữ liệu dòng xe này vĩnh viễn khỏi MongoDB database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? "Đang xóa..." : "Xác Nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
