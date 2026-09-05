import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import { MOCK_AVAILABLE_CARS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const conn = await connectToDatabase();
  let cars = MOCK_AVAILABLE_CARS;
  if (conn) {
    const docs = await CarModel.find({}).lean();
    if (docs.length > 0) cars = JSON.parse(JSON.stringify(docs));
  }

  return NextResponse.json({ success: true, data: cars });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const conn = await connectToDatabase();
    if (conn) {
      const newCar = await CarModel.create(body);
      return NextResponse.json({ success: true, data: newCar });
    }

    return NextResponse.json({ success: true, data: { ...body, id: `car-${Date.now()}` } });
  } catch {
    return NextResponse.json({ success: false, message: "Tạo xe mới thất bại." }, { status: 500 });
  }
}
