import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import BidModel from "@/lib/models/Bid";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const docs = await BidModel.find({}).sort({ createdAt: -1 }).lean();
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

    const price = Number(body.currentBid) || 900000000;
    const newBid = await BidModel.create({
      carName: body.carName || "VinFast VF 8",
      startingPrice: price,
      currentBid: price,
      image: body.image || "/uploads/vf8.jpg",
      location: body.location || "Đà Nẵng",
      style: body.style || "VF Electric",
      color: "Light Green",
      kaos: "850 KAOS",
      speed: "180 Speed: 15.6km/h",
      status: "Active",
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newBid)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Tạo phiên đấu giá thất bại." }, { status: 500 });
  }
}
