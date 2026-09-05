import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import mongoose from "mongoose";

const STATUSES = ["new", "contacted", "test_drive", "negotiating", "won", "lost"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "ID không hợp lệ." }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await LeadModel.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ success: false, message: "Không tìm thấy lead." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(doc)) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "ID không hợp lệ." }, { status: 400 });
  }

  try {
    const body = await request.json();
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    for (const field of ["name", "phone", "carInterest", "message", "source", "assignedTo"]) {
      if (body[field] !== undefined) update[field] = String(body[field]).trim();
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ." }, { status: 400 });
      }
      update.status = body.status;
    }
    if (body.priority !== undefined) {
      if (!PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ success: false, message: "Mức ưu tiên không hợp lệ." }, { status: 400 });
      }
      update.priority = body.priority;
    }

    if (Object.keys(update).length === 0 && !body.note) {
      return NextResponse.json({ success: false, message: "Không có gì để cập nhật." }, { status: 400 });
    }

    const mutation: Record<string, unknown> = { $set: update };
    if (body.note) {
      mutation.$push = {
        notes: {
          content: String(body.note).trim(),
          author: user.name || user.email,
          createdAt: new Date(),
        },
      };
    }

    const updated = await LeadModel.findByIdAndUpdate(id, mutation, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lead." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Cập nhật lead thất bại." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Chỉ quản trị viên mới được xoá lead." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "ID không hợp lệ." }, { status: 400 });
  }

  await connectToDatabase();
  const deleted = await LeadModel.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: "Không tìm thấy lead." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Đã xoá lead." });
}
