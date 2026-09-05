import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";

const STATUSES = ["new", "contacted", "test_drive", "negotiating", "won", "lost"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

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
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const assignedTo = searchParams.get("assignedTo") || "";
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const conn = await connectToDatabase();
  if (!conn) {
    return NextResponse.json({ success: true, total: 0, page, data: [] });
  }

  const filter: Record<string, unknown> = {};
  if (STATUSES.includes(status)) filter.status = status;
  if (PRIORITIES.includes(priority)) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { carInterest: rx }, { source: rx }];
  }

  const [docs, total] = await Promise.all([
    LeadModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LeadModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    total,
    page,
    limit,
    data: JSON.parse(JSON.stringify(docs)),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập họ tên và số điện thoại." },
        { status: 400 },
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Chưa cấu hình MONGODB_URI." },
        { status: 503 },
      );
    }

    const created = await LeadModel.create({
      name,
      phone,
      carInterest: String(body.carInterest ?? "").trim() || undefined,
      message: String(body.message ?? "").trim() || undefined,
      source: String(body.source ?? "").trim() || "CRM thủ công",
      status: STATUSES.includes(body.status) ? body.status : "new",
      priority: PRIORITIES.includes(body.priority) ? body.priority : "medium",
      assignedTo: String(body.assignedTo ?? "").trim(),
      notes: [
        {
          content: "Tạo thủ công từ CRM",
          author: user.name || user.email,
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(created)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Tạo lead thất bại." },
      { status: 500 },
    );
  }
}
