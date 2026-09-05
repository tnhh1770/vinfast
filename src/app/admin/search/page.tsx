import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Tìm kiếm — CRM VinFast Đà Nẵng",
};

export default async function AdminSearchPage() {
  await requireAdminUser();

  const conn = await connectToDatabase();
  const categories = conn
    ? ((await CarModel.distinct("category")) as string[]).filter(Boolean).sort()
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Tìm kiếm toàn hệ thống</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Tra cứu xe, khách hàng, hợp đồng và giao dịch trực tiếp trong MongoDB.
        </p>
      </div>

      <SearchClient initialCategories={categories} />
    </div>
  );
}
