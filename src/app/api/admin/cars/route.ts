import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import { revalidateCarPages } from "@/lib/revalidate";

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

    const name = String(body.name).trim();
    const heroImage = String(body.heroImage || "").trim();

    const newCar = await CarModel.create({
      // Form trong CRM chỉ nhập vài trường; phần còn lại phải có giá trị rỗng
      // hợp lệ để trang công khai của xe render được ngay sau khi tạo.
      sections: {},
      // Trang công khai của xe cần các trường SEO này; form CRM không nhập nên
      // suy ra từ tên xe để trang mới tạo vẫn hợp lệ.
      metaTitle: `${name} — Giá & Thông số tại VinFast Đà Nẵng`,
      metaDescription: `${name} tại đại lý VinFast Đà Nẵng: giá niêm yết, phí lăn bánh, chương trình trả góp và lịch lái thử.`,
      thumbnail: heroImage,
      installmentText: "",
      versions: [],
      options: [],
      promotions: [],
      colors: [],
      offers: [],
      ...body,
      price: Number(body.price) || 0,
    });

    revalidateCarPages(newCar.slug);

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newCar)) });
  } catch (error: unknown) {
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Slug này đã tồn tại, vui lòng chọn slug khác." },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, message: err.message || "Tạo xe mới thất bại." }, { status: 500 });
  }
}
