"use client";
/* eslint-disable @next/next/no-img-element -- ảnh xem trước trong CRM, không phải LCP của trang public */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  AlertTriangle,
  X,
  Search,
} from "lucide-react";
import type { ContentBlock, Post } from "@/types";
import { slugify } from "@/lib/slugify";
import { adminFetch, notify, readJson } from "@/lib/admin-api";

interface PostsClientProps {
  initialPosts: Post[];
  userRole: string;
}

/** Blocks -> văn bản soạn thảo (mỗi block là một đoạn cách nhau dòng trống). */
function blocksToText(blocks?: ContentBlock[]): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => {
      if (b.type === "paragraph") return b.text ?? b.html ?? "";
      if (b.type === "heading") return b.text;
      if (b.type === "list") return b.items.join("\n");
      if (b.type === "quote" || b.type === "caption") return b.text;
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function textToBlocks(text: string): ContentBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => ({ type: "paragraph" as const, text: t }));
}

function emptyForm() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    category: "Tin tức",
    publishedAt: new Date().toISOString().slice(0, 10),
    content: "",
  };
}

export default function PostsClient({ initialPosts, userRole }: PostsClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState(emptyForm);  // lazy initializer
  // Khi người dùng tự sửa slug thì thôi tự sinh theo tiêu đề.
  const [slugTouched, setSlugTouched] = useState(false);

  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q),
    );
  }, [posts, search]);

  function openAdd() {
    setEditingPost(null);
    setFormData(emptyForm());
    setSlugTouched(false);
    setIsFormOpen(true);
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      category: post.category || "Tin tức",
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
      content: blocksToText(post.blocks),
    });
    setSlugTouched(true);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    notify(null);

    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      excerpt: formData.excerpt,
      coverImage: formData.coverImage,
      category: formData.category,
      categorySlug: slugify(formData.category),
      publishedAt: formData.publishedAt,
      blocks: textToBlocks(formData.content),
    };

    const isEdit = Boolean(editingPost);
    const url = isEdit ? `/api/admin/posts/${editingPost!.slug}/` : "/api/admin/posts/";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson(res);

      if (data.success && data.data) {
        setPosts((prev) =>
          isEdit ? prev.map((p) => (p.slug === editingPost!.slug ? data.data : p)) : [data.data, ...prev],
        );
        setIsFormOpen(false);
        setEditingPost(null);
        notify({
          type: "success",
          text: isEdit ? "Đã cập nhật bài viết." : `Đã đăng bài “${data.data.title}”.`,
        });
      } else {
        notify({ type: "error", text: data.message || "Lưu bài viết thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingPost) return;
    setLoading(true);
    notify(null);

    try {
      const res = await adminFetch(`/api/admin/posts/${deletingPost.slug}/`, { method: "DELETE" });
      const data = await readJson(res);

      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.slug !== deletingPost.slug));
        notify({ type: "success", text: "Đã xoá bài viết." });
        setDeletingPost(null);
      } else {
        notify({ type: "error", text: data.message || "Xoá thất bại." });
      }
    } catch {
      notify({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Bài viết &amp; Tin tức</h1>
          <p className="mt-1 text-xs text-slate-400">
            {posts.length} bài viết đang xuất bản trên website
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết…"
              className="w-56 rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={openAdd}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Viết bài mới</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Tiêu đề bài viết</th>
              <th className="px-4 py-3.5">Chuyên mục</th>
              <th className="px-4 py-3.5">Ngày xuất bản</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((post) => (
              <tr key={post.slug} className="transition-colors hover:bg-slate-800/50">
                <td className="px-4 py-3.5 font-semibold text-white">
                  <div className="flex items-center gap-3">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-10 w-14 rounded border border-slate-800 bg-slate-950 object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="line-clamp-1 max-w-md">{post.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">/{post.slug}/</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="rounded border border-blue-800/50 bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300">
                    {post.category || "Tin tức"}
                  </span>
                </td>

                <td className="px-4 py-3.5 font-mono text-slate-400">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "—"}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/${post.slug}/`}
                      target="_blank"
                      title="Xem trên website"
                      className="rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => openEdit(post)}
                      title="Sửa bài viết"
                      className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {userRole === "admin" && (
                      <button
                        onClick={() => setDeletingPost(post)}
                        title="Xoá bài viết"
                        className="cursor-pointer rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-all hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="py-14 text-center text-xs text-slate-500">
            {posts.length === 0
              ? "Chưa có bài viết nào. Bấm “Viết bài mới” để bắt đầu."
              : "Không có bài viết nào khớp từ khoá."}
          </p>
        )}
      </div>

      {/* Modal soạn / sửa bài */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                {editingPost ? (
                  <Pencil className="h-5 w-5 text-blue-400" />
                ) : (
                  <Plus className="h-5 w-5 text-emerald-400" />
                )}
                <span>{editingPost ? "Sửa bài viết" : "Viết bài mới"}</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-3 overflow-y-auto p-6 text-xs">
              <div>
                <label htmlFor="post-title" className="mb-1 block font-semibold text-slate-300">
                  Tiêu đề *
                </label>
                <input
                  id="post-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      title,
                      slug: slugTouched ? p.slug : slugify(title),
                    }));
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="post-slug" className="mb-1 block font-semibold text-slate-300">
                  Đường dẫn (slug) *
                </label>
                <input
                  id="post-slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setFormData((p) => ({ ...p, slug: e.target.value }));
                  }}
                  className={`${inputClass} font-mono`}
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Bài viết sẽ hiển thị tại <span className="font-mono">/{formData.slug || "..."}/</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="post-category" className="mb-1 block font-semibold text-slate-300">
                    Chuyên mục
                  </label>
                  <input
                    id="post-category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="post-date" className="mb-1 block font-semibold text-slate-300">
                    Ngày xuất bản
                  </label>
                  <input
                    id="post-date"
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData((p) => ({ ...p, publishedAt: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="post-cover" className="mb-1 block font-semibold text-slate-300">
                  Ảnh bìa (đường dẫn)
                </label>
                <input
                  id="post-cover"
                  type="text"
                  placeholder="/uploads/2026/09/anh-bia.webp"
                  value={formData.coverImage}
                  onChange={(e) => setFormData((p) => ({ ...p, coverImage: e.target.value }))}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label htmlFor="post-excerpt" className="mb-1 block font-semibold text-slate-300">
                  Mô tả ngắn (hiển thị ở danh sách &amp; kết quả tìm kiếm Google)
                </label>
                <textarea
                  id="post-excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="post-content" className="mb-1 block font-semibold text-slate-300">
                  Nội dung
                </label>
                <textarea
                  id="post-content"
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Mỗi đoạn văn cách nhau một dòng trống."
                  className={`${inputClass} leading-relaxed`}
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Mỗi đoạn cách nhau một dòng trống sẽ thành một khối nội dung trên website.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg disabled:opacity-50 ${
                    editingPost
                      ? "bg-blue-600 shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
                  }`}
                >
                  {loading ? "Đang lưu..." : editingPost ? "Lưu thay đổi" : "Đăng bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xoá */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-rose-900/60 bg-slate-900 p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Xoá bài viết?</h3>
            <p className="text-xs text-slate-400">
              Bài <strong className="text-slate-200">“{deletingPost.title}”</strong> sẽ bị gỡ khỏi website.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingPost(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
