import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    const conn = await connectToDatabase();
    if (conn && user._id) {
      await UserModel.findByIdAndUpdate(user._id, { name, email });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công.",
      user: { ...user, name, email },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi cập nhật profile." }, { status: 500 });
  }
}
