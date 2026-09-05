import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import LeadModel from "@/lib/models/Lead";
import DealModel from "@/lib/models/Deal";
import TransactionModel from "@/lib/models/Transaction";

/** Thoát ký tự đặc biệt để chuỗi người dùng nhập không phá vỡ regex. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const scope = (searchParams.get("scope") || "all").trim();
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 0;

  const conn = await connectToDatabase();
  if (!conn) {
    return NextResponse.json(
      { success: false, message: "Chưa cấu hình MONGODB_URI." },
      { status: 503 },
    );
  }

  const rx = q ? new RegExp(escapeRegex(q), "i") : null;

  const carFilter: Record<string, unknown> = {};
  if (rx) carFilter.$or = [{ name: rx }, { slug: rx }, { category: rx }, { group: rx }];
  if (category && category !== "all") carFilter.category = category;
  if (minPrice || maxPrice) {
    carFilter.price = {
      ...(minPrice ? { $gte: minPrice } : {}),
      ...(maxPrice ? { $lte: maxPrice } : {}),
    };
  }

  const wantCars = scope === "all" || scope === "cars";
  const wantLeads = scope === "all" || scope === "leads";
  const wantDeals = scope === "all" || scope === "deals";
  const wantTransactions = scope === "all" || scope === "transactions";

  const [cars, leads, deals, transactions, categories] = await Promise.all([
    wantCars ? CarModel.find(carFilter).sort({ price: 1 }).limit(60).lean() : [],
    wantLeads && rx
      ? LeadModel.find({ $or: [{ name: rx }, { phone: rx }, { carInterest: rx }, { source: rx }] })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean()
      : [],
    wantDeals && rx
      ? DealModel.find({ $or: [{ dealId: rx }, { ownerName: rx }, { carType: rx }] })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean()
      : [],
    wantTransactions && rx
      ? TransactionModel.find({
          $or: [{ transactionId: rx }, { ownerName: rx }, { carType: rx }],
        })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean()
      : [],
    CarModel.distinct("category"),
  ]);

  const plain = <T,>(v: unknown) => JSON.parse(JSON.stringify(v)) as T;

  return NextResponse.json({
    success: true,
    query: { q, category, scope, minPrice, maxPrice },
    totalFound: cars.length + leads.length + deals.length + transactions.length,
    categories: (categories as string[]).filter(Boolean).sort(),
    data: {
      cars: plain(cars),
      leads: plain(leads),
      deals: plain(deals),
      transactions: plain(transactions),
    },
  });
}
