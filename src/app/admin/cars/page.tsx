import "server-only";
import { getCars } from "@/lib/repo";
import { getSessionUser } from "@/lib/auth";
import { CarPricingClient } from "@/components/admin/cars/car-pricing-client";

export const metadata = {
  title: "Quản lý Bảng giá Xe CRM — VinFast Đà Nẵng",
};

export default async function AdminCarsPage() {
  const user = await getSessionUser();
  const cars = await getCars();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Xe & Bảng giá Ưu đãi</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cập nhật giá niêm yết, ưu đãi %, phiên bản & tùy chọn cho 12 dòng xe VinFast
        </p>
      </div>

      <CarPricingClient initialCars={cars} userRole={user?.role || "sales"} />
    </div>
  );
}
