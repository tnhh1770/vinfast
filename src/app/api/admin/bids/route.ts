import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BidModel from "@/lib/models/Bid";
import { MOCK_BIDS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let bids = MOCK_BIDS;
  if (conn) {
    const docs = await BidModel.find({}).sort({ createdAt: -1 }).lean();
    if (docs.length > 0) bids = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: bids });
}
