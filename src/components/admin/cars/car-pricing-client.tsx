"use client";
/* eslint-disable @next/next/no-img-element -- ảnh xem trước trong CRM, không phải LCP của trang public */

import { useState } from "react";
import type { Car } from "@/types";
import { formatVnd } from "@/lib/format";
import { updateCarPricingAction } from "@/app/actions/crm";
import { toast } from "sonner";
import { Edit2, Check, X } from "lucide-react";

interface CarPricingClientProps {
  initialCars: Car[];
  userRole: string;
}

export function CarPricingClient({ initialCars, userRole }: CarPricingClientProps) {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  function startEdit(car: Car) {
    setEditingSlug(car.slug);
    setEditPrice(car.price);
  }

  async function saveEdit(slug: string) {
    try {
      const car = cars.find((c) => c.slug === slug);
      if (!car) return;

      const result = await updateCarPricingAction(slug, editPrice, car.promotions || []);
      if (!result.success) {
        toast.error(result.message ?? "Cập nhật thất bại");
        return;
      }

      setCars(cars.map((c) => (c.slug === slug ? { ...c, price: editPrice } : c)));
      setEditingSlug(null);
      toast.success(result.message ?? "Đã cập nhật giá xe.");
    } catch {
      toast.error("Lỗi kết nối máy chủ.");
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          <tr>
            <th className="px-4 py-3.5">Xe VinFast</th>
            <th className="px-4 py-3.5">Danh mục</th>
            <th className="px-4 py-3.5">Giá Niêm Yết hiện tại</th>
            <th className="px-4 py-3.5">Số Phiên Bản</th>
            <th className="px-4 py-3.5">Chương trình Ưu đãi</th>
            <th className="px-4 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {cars.map((car) => {
            const isEditing = editingSlug === car.slug;

            return (
              <tr key={car.slug} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3.5 font-bold text-white flex items-center gap-3">
                  {car.thumbnail && (
                    <img
                      src={car.thumbnail}
                      alt={car.name}
                      className="h-10 w-16 object-contain rounded bg-slate-950 p-1 border border-slate-800"
                    />
                  )}
                  <span>{car.name}</span>
                </td>

                <td className="px-4 py-3.5 text-slate-400">{car.category || "Xe ô tô điện"}</td>

                <td className="px-4 py-3.5 font-semibold text-emerald-400 text-sm">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-36 rounded border border-blue-500 bg-slate-950 px-2 py-1 text-xs text-white"
                    />
                  ) : (
                    formatVnd(car.price)
                  )}
                </td>

                <td className="px-4 py-3.5 text-slate-300 font-medium">
                  {car.versions ? `${car.versions.length} phiên bản` : "1 phiên bản"}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {car.promotions && car.promotions.length > 0 ? (
                      car.promotions.map((p, i) => (
                        <span key={i} className="rounded bg-blue-950 border border-blue-800/50 px-2 py-0.5 text-[10px] text-blue-300">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Không có</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3.5 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => saveEdit(car.slug)}
                        className="rounded p-1 text-emerald-400 hover:bg-emerald-500/20"
                        title="Lưu"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSlug(null)}
                        className="rounded p-1 text-rose-400 hover:bg-rose-500/20"
                        title="Hủy"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    userRole === "admin" && (
                      <button
                        onClick={() => startEdit(car)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Sửa giá</span>
                      </button>
                    )
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
