import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: `Đã cập nhật giao dịch ${id} thành công.`,
    data: { _id: id, ...body },
  });
}
