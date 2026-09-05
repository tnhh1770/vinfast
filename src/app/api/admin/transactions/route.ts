import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TransactionModel from "@/lib/models/Transaction";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const docs = await TransactionModel.find({}).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(docs)) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await connectToDatabase();
    const newTx = await TransactionModel.create(body);
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newTx)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Tạo giao dịch tài chính thất bại." },
      { status: 500 },
    );
  }
}
