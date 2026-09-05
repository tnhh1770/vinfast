import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CalendarEventModel from "@/lib/models/CalendarEvent";
import { MOCK_CALENDAR_EVENTS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let events = MOCK_CALENDAR_EVENTS;
  if (conn) {
    const docs = await CalendarEventModel.find({}).sort({ createdAt: -1 }).lean();
    if (docs.length > 0) events = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: events });
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
      const newEv = await CalendarEventModel.create(body);
      return NextResponse.json({ success: true, data: newEv });
    }
    return NextResponse.json({ success: true, data: { ...body, _id: `cal-${Date.now()}` } });
  } catch {
    return NextResponse.json({ success: false, message: "Tạo lịch hẹn thất bại." }, { status: 500 });
  }
}
