import { NextResponse } from "next/server";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";

/** Không bao giờ trả passwordHash ra ngoài. */
const PUBLIC_FIELDS = "_id email name role createdAt updatedAt";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  if (!conn) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Nhân viên sales vẫn cần danh sách đồng nghiệp để gán lead, nhưng chỉ admin
  // mới thấy toàn bộ thông tin quản trị.
  const docs = await UserModel.find({}).select(PUBLIC_FIELDS).sort({ createdAt: 1 }).lean();

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(docs)) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Chỉ quản trị viên mới được tạo tài khoản." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = body.role === "sales" ? "sales" : "admin";

    if (!name) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập họ tên." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Email không hợp lệ." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải từ 8 ký tự trở lên." },
        { status: 400 },
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Chưa cấu hình MONGODB_URI." },
        { status: 503 },
      );
    }

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }

    const created = await UserModel.create({
      name,
      email,
      role,
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản ${email}.`,
      data: {
        _id: String(created._id),
        name: created.name,
        email: created.email,
        role: created.role,
        createdAt: created.createdAt,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Tạo tài khoản thất bại." },
      { status: 500 },
    );
  }
}
