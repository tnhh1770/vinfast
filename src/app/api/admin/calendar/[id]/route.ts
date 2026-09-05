import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  return NextResponse.json({ success: true, message: `Đã xóa lịch hẹn ${id}.` });
}
