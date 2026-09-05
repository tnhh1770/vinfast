import "server-only";
import { getPosts } from "@/lib/repo";
import { getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { FileText, Calendar, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Quản lý Bài viết & Tin tức CRM — VinFast Đà Nẵng",
};

export default async function AdminPostsPage() {
  const user = await getSessionUser();
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Bài viết & Tin tức</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng {posts.length} bài viết ưu đãi, khuyến mãi & thông số kỹ thuật xe VinFast Đà Nẵng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-4 py-3.5">Tiêu đề Bài viết</th>
              <th className="px-4 py-3.5">Chuyên mục</th>
              <th className="px-4 py-3.5">Ngày Xuất bản</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {posts.map((post) => (
              <tr key={post.slug} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-white">
                  <div className="flex items-center gap-3">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-10 w-14 object-cover rounded bg-slate-950 border border-slate-800"
                      />
                    )}
                    <span className="line-clamp-1 max-w-md">{post.title}</span>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="rounded bg-blue-950 border border-blue-800/50 px-2 py-0.5 text-[10px] text-blue-300">
                    {post.category || "Tin tức"}
                  </span>
                </td>

                <td className="px-4 py-3.5 font-mono text-slate-400">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "-"}
                </td>

                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/${post.slug}/`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem bài</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
