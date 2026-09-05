import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TrackingModel from "@/lib/models/Tracking";
import { MOCK_TRACKINGS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let trackings = MOCK_TRACKINGS;
  if (conn) {
    const docs = await TrackingModel.find({}).sort({ createdAt: -1 }).lean();
    if (docs.length > 0) trackings = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: trackings });
}
