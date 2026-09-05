"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Download, ArrowUpRight, Plus, Edit3, Trash2, Search, X, AlertTriangle } from "lucide-react";
import type { Car } from "@/types";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface ListingClientProps {
  initialCars: Car[];
}

export default function ListingClient({ initialCars }: ListingClientProps) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "SUV Electric",
    price: 0,
    nedc: "400 km/sạc",
    group: "xe-du-lich",
    heroImage: "/uploads/vf8.jpg",
  });

  const [loading, setLoading] = useState(false);

  const categories = ["ALL", ...Array.from(new Set(cars.map((c) => c.category).filter(Boolean)))];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.slug && car.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setFormData({
      name: "",
      slug: "",
      category: "A-SUV",
      price: 500000000,
      nedc: "350 km/sạc",
      group: "xe-du-lich",
      heroImage: "/uploads/vf8.jpg",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setFormData({
      name: car.name || "",
      slug: car.slug || "",
      category: car.category || "A-SUV",
      price: car.price || 0,
      nedc: car.nedc || "350 km/sạc",
      group: car.group || "xe-du-lich",
      heroImage: car.heroImage || car.thumbnail || "/uploads/vf8.jpg",
    });
  };

  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCar ? prev.slug : autoSlug,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch("/api/admin/cars/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setCars((prev) => [data.data, ...prev]);
        setIsAddModalOpen(false);
        notify({ type: "success", text: `Đã thêm xe "${data.data.name}" thành công!` });
      } else {
        notify({ type: "error", text: data.message || "Thêm xe thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    setLoading(true);
    notify(null);

    const carId = editingCar.slug || editingCar._id;

    try {
      const res = await adminFetch(`/api/admin/cars/${carId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setCars((prev) =>
          prev.map((c) => (c._id === editingCar._id || c.slug === editingCar.slug ? { ...c, ...data.data } : c))
        );
        setEditingCar(null);
        notify({ type: "success", text: `Đã cập nhật xe "${data.data.name}" vào MongoDB!` });
      } else {
        notify({ type: "error", text: data.message || "Cập nhật xe thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCar) return;
    setLoading(true);
    notify(null);

    const carId = deletingCar.slug || deletingCar._id;

    try {
      const res = await adminFetch(`/api/admin/cars/${carId}/`, {
        method: "DELETE",
      });
      const data = await readJson(res);

      if (data.success) {
        setCars((prev) => prev.filter((c) => c._id !== deletingCar._id && c.slug !== deletingCar.slug));
        notify({ type: "success", text: `Đã xóa xe "${deletingCar.name}" khỏi MongoDB.` });
        setDeletingCar(null);
      } else {
        notify({ type: "error", text: data.message || "Xóa xe thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ khi xóa xe." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {/* Header controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kho xe</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <strong className="text-blue-400 font-semibold">{cars.length} dòng xe</strong> trong hệ thống. Bạn có thể Thêm mới, Sửa hoặc Xóa trực tiếp vào Database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Thêm Xe Mới</span>
          </button>

          <a
            href="/api/admin/cars/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất JSON</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm xe theo tên hoặc slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Real Cars from MongoDB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 py-16 text-center text-sm text-slate-500">
            {cars.length === 0
              ? "Kho xe đang trống. Bấm “Thêm xe mới” hoặc chạy `npm run seed`."
              : "Không có xe nào khớp bộ lọc hiện tại."}
          </div>
        )}

        {filteredCars.map((car) => (
          <div
            key={car.slug || String(car._id)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-blue-500/50"
          >
            <div>
              {/* Car Title Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 font-bold text-xs text-blue-400">
                    {car.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{car.name}</h4>
                    <p className="text-[11px] text-slate-400">{car.category || "D-SUV Electric"}</p>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(car)}
                    title="Chỉnh sửa xe"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCar(car)}
                    title="Xóa xe"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
              <div className="my-4 flex h-36 items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800/60 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước trong CRM, không ảnh hưởng LCP trang public */}
                <img
                  src={car.thumbnail || car.heroImage || "/uploads/vf8.jpg"}
                  alt={car.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Price & View Action */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Giá niêm yết</span>
                <span className="text-base font-bold text-emerald-400">
                  {car.price ? `${car.price.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                </span>
              </div>
              <Link
                href={`/admin/cars/${car.slug}/`}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Chi tiết</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Car */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <span>Thêm Xe Mới Vào MongoDB</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Dòng Xe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: VinFast VF Wild"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="vinfast-vf-wild"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-slate-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phân Khúc</label>
                  <input
                    type="text"
                    placeholder="SUV điện cỡ A"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá Bán (VND) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1200000000"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NEDC / Tầm Bay</label>
                  <input
                    type="text"
                    placeholder="450 km/sạc"
                    value={formData.nedc}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nedc: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm Xe</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData((prev) => ({ ...prev, group: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="xe-du-lich">Xe du lịch</option>
                    <option value="xe-dich-vu">Xe dịch vụ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Hình Ảnh Xe</label>
                <input
                  type="text"
                  placeholder="/uploads/vf8.jpg"
                  value={formData.heroImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroImage: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Tạo Xe Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Car */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-400" />
                <span>Chỉnh Sửa Xe: {editingCar.name}</span>
              </h3>
              <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Dòng Xe *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phân Khúc</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá Bán (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NEDC / Tầm Bay</label>
                  <input
                    type="text"
                    value={formData.nedc}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nedc: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm Xe</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData((prev) => ({ ...prev, group: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="xe-du-lich">Xe du lịch</option>
                    <option value="xe-dich-vu">Xe dịch vụ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Hình Ảnh Hero</label>
                <input
                  type="text"
                  value={formData.heroImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroImage: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? "Đang cập nhật..." : "Lưu Cập Nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Delete */}
      {deletingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xóa Xe Khỏi MongoDB?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa dòng xe <strong className="text-rose-400">{deletingCar.name}</strong> không? Hành động này sẽ xóa bản ghi khỏi MongoDB và không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCar(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Hủy bỏ
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
