import { NextResponse } from "next/server";

import { leadSchema } from "@/lib/lead-schema";
import LeadModel from "@/lib/models/Lead";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "JSON không hợp lệ" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Dữ liệu không hợp lệ", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { ok: false, message: "Chưa cấu hình MONGODB_URI" },
        { status: 503 },
      );
    }
    const lead = await LeadModel.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      carInterest: parsed.data.carInterest || undefined,
      message: parsed.data.message || undefined,
      source: parsed.data.source,
      path: parsed.data.path || undefined,
    });
    return NextResponse.json({ ok: true, id: String(lead._id) }, { status: 201 });
  } catch (error) {
    console.error("[api/leads]", error);
    return NextResponse.json({ ok: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
