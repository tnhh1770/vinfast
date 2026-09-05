import { NextResponse } from "next/server";
import { getSessionUser, hashPassword, verifyPassword, setSessionCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mật khẩu hiện tại." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới phải từ 8 ký tự trở lên." },
        { status: 400 },
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới phải khác mật khẩu hiện tại." },
        { status: 400 },
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Chưa cấu hình MONGODB_URI nên không thể đổi mật khẩu." },
        { status: 503 },
      );
    }

    const doc = await UserModel.findById(user._id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
    }

    // Bắt buộc xác minh mật khẩu hiện tại trước khi cho đổi.
    if (!verifyPassword(currentPassword, doc.passwordHash)) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu hiện tại không chính xác." },
        { status: 403 },
      );
    }

    doc.passwordHash = hashPassword(newPassword);
    await doc.save();

    // Cấp lại token để phiên hiện tại vẫn hợp lệ sau khi đổi mật khẩu.
    await setSessionCookie({
      id: String(doc._id),
      email: doc.email,
      name: doc.name,
      role: doc.role,
    });

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (error) {
    console.error("[api/admin/auth/password]", error);
    return NextResponse.json({ success: false, message: "Lỗi đổi mật khẩu." }, { status: 500 });
  }
}
