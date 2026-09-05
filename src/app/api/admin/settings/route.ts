import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SettingModel from "@/lib/models/Setting";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let setting = null;
  if (conn) {
    setting = await SettingModel.findOne({}).lean();
  }

  return NextResponse.json({
    success: true,
    data: setting || {
      currency: "VND",
      language: "Tiếng Việt",
      address: "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng",
      state: "Đà Nẵng",
      emailNotification: true,
      smsNotification: true,
    },
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const conn = await connectToDatabase();
    if (conn) {
      await SettingModel.findOneAndUpdate({}, body, { upsert: true });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cài đặt CRM thành công vào Cơ sở dữ liệu.",
      data: body,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Cập nhật cài đặt thất bại." }, { status: 500 });
  }
}
