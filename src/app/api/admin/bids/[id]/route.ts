import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BidModel from "@/lib/models/Bid";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const updated = await BidModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy phiên đấu giá." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Cập nhật đấu giá thất bại." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    await BidModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Đã xóa phiên đấu giá thành công." });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Xóa đấu giá thất bại." }, { status: 500 });
  }
}
