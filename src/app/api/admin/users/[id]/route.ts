import { NextResponse } from "next/server";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return {
      error: NextResponse.json(
        { success: false, message: "Chỉ quản trị viên mới được thao tác." },
        { status: 403 },
      ),
    };
  }
  return { user };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "ID không hợp lệ." }, { status: 400 });
  }

  try {
    const body = await request.json();
    await connectToDatabase();

    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ success: false, message: "Họ tên không được trống." }, { status: 400 });
      }
      update.name = name;
    }

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, message: "Email không hợp lệ." }, { status: 400 });
      }
      const duplicate = await UserModel.findOne({ email, _id: { $ne: id } }).lean();
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Email này đã được tài khoản khác sử dụng." },
          { status: 409 },
        );
      }
      update.email = email;
    }

    if (body.role !== undefined) {
      if (body.role !== "admin" && body.role !== "sales") {
        return NextResponse.json({ success: false, message: "Vai trò không hợp lệ." }, { status: 400 });
      }
      // Không cho hạ cấp admin cuối cùng, tránh khoá cửa toàn hệ thống.
      if (body.role === "sales") {
        const target = await UserModel.findById(id).lean();
        if (target?.role === "admin") {
          const adminCount = await UserModel.countDocuments({ role: "admin" });
          if (adminCount <= 1) {
            return NextResponse.json(
              { success: false, message: "Phải còn ít nhất một quản trị viên trong hệ thống." },
              { status: 409 },
            );
          }
        }
      }
      update.role = body.role;
    }

    if (body.password) {
      const password = String(body.password);
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu phải từ 8 ký tự trở lên." },
          { status: 400 },
        );
      }
      update.passwordHash = hashPassword(password);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: "Không có gì để cập nhật." }, { status: 400 });
    }

    const updated = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .select("_id email name role createdAt updatedAt")
      .lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật tài khoản.",
      data: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Cập nhật tài khoản thất bại." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "ID không hợp lệ." }, { status: 400 });
  }

  // Tự xoá chính mình sẽ khiến phiên hiện tại treo giữa chừng.
  if (String(guard.user?._id) === id) {
    return NextResponse.json(
      { success: false, message: "Không thể tự xoá tài khoản đang đăng nhập." },
      { status: 409 },
    );
  }

  try {
    await connectToDatabase();

    const target = await UserModel.findById(id).lean();
    if (!target) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    if (target.role === "admin") {
      const adminCount = await UserModel.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Phải còn ít nhất một quản trị viên trong hệ thống." },
          { status: 409 },
        );
      }
    }

    await UserModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Đã xoá tài khoản." });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Xoá tài khoản thất bại." },
      { status: 500 },
    );
  }
}
