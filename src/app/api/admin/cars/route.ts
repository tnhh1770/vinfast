import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const docs = await CarModel.find({}).lean();
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

    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, message: "Vui lòng điền Tên xe và Slug." }, { status: 400 });
    }

    const newCar = await CarModel.create({
      ...body,
      price: Number(body.price) || 0,
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newCar)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Tạo xe mới thất bại." }, { status: 500 });
  }
}
