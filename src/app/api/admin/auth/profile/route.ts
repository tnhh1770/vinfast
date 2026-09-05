import { NextResponse } from "next/server";
import { getSessionUser, setSessionCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập họ tên." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Email không hợp lệ." }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Chưa cấu hình MONGODB_URI nên không thể cập nhật hồ sơ." },
        { status: 503 },
      );
    }

    // Không cho trùng email với tài khoản khác.
    const duplicate = await UserModel.findOne({ email, _id: { $ne: user._id } }).lean();
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Email này đã được một tài khoản khác sử dụng." },
        { status: 409 },
      );
    }

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { name, email },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    // Token đang giữ name/email cũ -> phải cấp lại, nếu không sidebar hiển thị sai.
    await setSessionCookie({
      id: String(updated._id),
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công.",
      user: { _id: String(updated._id), name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (error) {
    console.error("[api/admin/auth/profile]", error);
    return NextResponse.json({ success: false, message: "Lỗi cập nhật hồ sơ." }, { status: 500 });
  }
}
