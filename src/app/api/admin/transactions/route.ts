import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TransactionModel from "@/lib/models/Transaction";
import { MOCK_TRANSACTIONS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let transactions = MOCK_TRANSACTIONS;
  if (conn) {
    const docs = await TransactionModel.find({}).sort({ createdAt: -1 }).lean();
    if (docs.length > 0) transactions = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: transactions });
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
      const newTx = await TransactionModel.create(body);
      return NextResponse.json({ success: true, data: newTx });
    }
    return NextResponse.json({ success: true, data: { ...body, _id: `tx-${Date.now()}` } });
  } catch {
    return NextResponse.json({ success: false, message: "Tạo giao dịch tài chính thất bại." }, { status: 500 });
  }
}
