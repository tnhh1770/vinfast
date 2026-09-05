import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BidModel from "@/lib/models/Bid";
import mongoose from "mongoose";

/** Bước giá tối thiểu mỗi lần đặt: 10 triệu đồng. */
const MIN_INCREMENT = 10_000_000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Mã phiên đấu giá không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    await connectToDatabase();

    const bid = await BidModel.findById(id);
    if (!bid) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phiên đấu giá." },
        { status: 404 },
      );
    }

    if (bid.status !== "Active") {
      return NextResponse.json(
        { success: false, message: "Phiên đấu giá đã đóng, không thể trả giá thêm." },
        { status: 409 },
      );
    }

    // Không truyền amount -> tự nâng một bước giá.
    const amount = Number(body.amount) || bid.currentBid + MIN_INCREMENT;
    const minimum = bid.currentBid + MIN_INCREMENT;

    if (amount < minimum) {
      return NextResponse.json(
        {
          success: false,
          message: `Mức giá phải từ ${minimum.toLocaleString("vi-VN")} ₫ trở lên (bước tối thiểu ${MIN_INCREMENT.toLocaleString("vi-VN")} ₫).`,
        },
        { status: 400 },
      );
    }

    bid.currentBid = amount;
    await bid.save();

    return NextResponse.json({
      success: true,
      message: `Đã nâng giá xe ${bid.carName} lên ${amount.toLocaleString("vi-VN")} ₫.`,
      data: JSON.parse(JSON.stringify(bid)),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Đặt mức đấu giá thất bại." },
      { status: 500 },
    );
  }
}
