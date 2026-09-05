import { NextResponse } from "next/server";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Mật khẩu phải từ 6 ký tự trở lên." }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn && user._id) {
      await UserModel.findByIdAndUpdate(user._id, { passwordHash: hashPassword(newPassword) });
    }

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Lỗi đổi mật khẩu." }, { status: 500 });
  }
}
