import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import DealModel from "@/lib/models/Deal";
import { MOCK_DEALS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let deals = MOCK_DEALS;
  if (conn) {
    const docs = await DealModel.find({}).sort({ createdAt: -1 }).lean();
    if (docs.length > 0) deals = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: deals });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const conn = await connectToDatabase();
    if (conn) {
      const newDeal = await DealModel.create(body);
      return NextResponse.json({ success: true, data: newDeal });
    }
    return NextResponse.json({ success: true, data: { ...body, _id: `deal-${Date.now()}` } });
  } catch {
    return NextResponse.json({ success: false, message: "Tạo hợp đồng deal thất bại." }, { status: 500 });
  }
}
