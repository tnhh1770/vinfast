import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TrackingModel from "@/lib/models/Tracking";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const docs = await TrackingModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(docs)) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await connectToDatabase();

    const newTracking = await TrackingModel.create({
      customerName: body.name || "Khách Hàng Mới",
      carName: body.carType || "VinFast VF 8",
      routeName: "Tuyến đường Đà Nẵng - Hà Nội",
      locationAddress: body.location || "Đà Nẵng",
      status: body.status || "In Transit",
      carImage: body.image || "/uploads/vf8.jpg",
      driverName: "Đại lý VinFast",
      timeLeftMin: 48,
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newTracking)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Tạo tracking thất bại." }, { status: 500 });
  }
}
