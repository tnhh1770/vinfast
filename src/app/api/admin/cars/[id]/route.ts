import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import mongoose from "mongoose";
import { revalidateCarPages } from "@/lib/revalidate";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const car = await CarModel.findOne({
    $or: [
      { slug: id },
      ...(isValidObjectId(id) ? [{ _id: id }] : []),
    ],
  }).lean();

  if (!car) {
    return NextResponse.json({ success: false, message: "Không tìm thấy xe." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(car)) });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const updated = await CarModel.findOneAndUpdate(
      {
        $or: [
          { slug: id },
          ...(isValidObjectId(id) ? [{ _id: id }] : []),
        ],
      },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy xe để cập nhật." }, { status: 404 });
    }

    revalidateCarPages((updated as { slug?: string }).slug);

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Cập nhật thất bại." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await CarModel.findOneAndDelete({
      $or: [
        { slug: id },
        ...(isValidObjectId(id) ? [{ _id: id }] : []),
      ],
    }).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Không tìm thấy xe để xóa." }, { status: 404 });
    }

    revalidateCarPages((deleted as { slug?: string }).slug);

    return NextResponse.json({ success: true, message: "Đã xóa xe thành công." });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message || "Xóa xe thất bại." }, { status: 500 });
  }
}
