import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getPosts } from "@/lib/repo";
import PostsClient from "./PostsClient";

export const metadata = {
  title: "Bài viết & Tin tức — CRM VinFast Đà Nẵng",
};

export default async function AdminPostsPage() {
  const user = await requireAdminUser();
  const posts = await getPosts();

  return <PostsClient initialPosts={posts} userRole={user.role} />;
}
