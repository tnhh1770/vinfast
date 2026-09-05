import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import PostModel from "@/lib/models/Post";
import { revalidatePostPages } from "@/lib/revalidate";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const docs = await PostModel.find({}).sort({ publishedAt: -1 }).lean();

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(docs)) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập tiêu đề." }, { status: 400 });
    }

    const slug = String(body.slug ?? "").trim() || slugify(title);
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Không tạo được slug từ tiêu đề, vui lòng nhập slug thủ công." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const now = new Date().toISOString();
    const created = await PostModel.create({
      slug,
      title,
      excerpt: String(body.excerpt ?? "").trim(),
      coverImage: String(body.coverImage ?? "").trim(),
      category: String(body.category ?? "Tin tức").trim(),
      categorySlug: String(body.categorySlug ?? "").trim() || slugify(String(body.category ?? "Tin tức")),
      publishedAt: body.publishedAt || now,
      updatedAt: now,
      // Nội dung dài soạn dưới dạng đoạn văn, mỗi dòng trống ngăn một block.
      blocks: Array.isArray(body.blocks)
        ? body.blocks
        : String(body.content ?? "")
            .split(/\n\s*\n/)
            .map((text: string) => text.trim())
            .filter(Boolean)
            .map((text: string) => ({ type: "paragraph", text })),
    });

    revalidatePostPages(created.slug);

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(created)) });
  } catch (error: unknown) {
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Slug này đã tồn tại, vui lòng chọn slug khác." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || "Tạo bài viết thất bại." },
      { status: 500 },
    );
  }
}
