import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { amount } = body;

    return NextResponse.json({
      success: true,
      message: `Đã đặt mức đấu giá thành công: $${amount} cho xe ${id}.`,
      currentBid: amount,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi đặt mức đấu giá." }, { status: 500 });
  }
}
