import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import PostModel from "@/lib/models/Post";
import { revalidatePostPages } from "@/lib/revalidate";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { slug } = await params;
  await connectToDatabase();

  const doc = await PostModel.findOne({ slug }).lean();
  if (!doc) {
    return NextResponse.json({ success: false, message: "Không tìm thấy bài viết." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(doc)) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    await connectToDatabase();

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const field of ["title", "excerpt", "coverImage", "category", "categorySlug", "publishedAt"]) {
      if (body[field] !== undefined) update[field] = String(body[field]).trim();
    }
    if (Array.isArray(body.blocks)) update.blocks = body.blocks;

    if (body.slug !== undefined && String(body.slug).trim() && String(body.slug).trim() !== slug) {
      const newSlug = String(body.slug).trim();
      const duplicate = await PostModel.findOne({ slug: newSlug }).lean();
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Slug mới đã được bài viết khác sử dụng." },
          { status: 409 },
        );
      }
      update.slug = newSlug;
    }

    const updated = await PostModel.findOneAndUpdate({ slug }, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài viết." }, { status: 404 });
    }

    revalidatePostPages(slug);
    const newSlug = (updated as { slug?: string }).slug;
    if (newSlug && newSlug !== slug) revalidatePostPages(newSlug);

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Cập nhật bài viết thất bại." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Chỉ quản trị viên mới được xoá bài viết." },
      { status: 403 },
    );
  }

  try {
    const { slug } = await params;
    await connectToDatabase();

    const deleted = await PostModel.findOneAndDelete({ slug }).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài viết." }, { status: 404 });
    }

    revalidatePostPages(slug);

    return NextResponse.json({ success: true, message: "Đã xoá bài viết." });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Xoá bài viết thất bại." },
      { status: 500 },
    );
  }
}
