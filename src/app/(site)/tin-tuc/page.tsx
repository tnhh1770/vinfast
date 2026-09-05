import type { Metadata } from "next";

import { PostCard } from "@/components/news/post-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getPosts } from "@/lib/repo";
import { breadcrumbSchema, buildMetadata, graph, itemListSchema } from "@/lib/seo";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Tin Tức Xe Điện VinFast Mới Nhất",
  description:
    "Cập nhật tin tức xe điện VinFast: ra mắt mẫu xe mới, chương trình ưu đãi, công nghệ, chính sách pin và trải nghiệm thực tế từ người dùng.",
  path: "/tin-tuc",
  keywords: ["tin tức vinfast", "tin xe điện vinfast", "vinfast mới nhất"],
});

export default async function NewsPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Tin tức", href: "/tin-tuc" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Tin tức"
          title="Tin tức xe điện VinFast"
          description="Tin tức, đánh giá và chương trình ưu đãi mới nhất về xe điện VinFast tại thị trường Việt Nam."
        />
        <h1 className="sr-only">Tin tức xe điện VinFast</h1>

        {featured ? (
          <div className="mt-9">
            <PostCard post={featured} variant="horizontal" priority />
          </div>
        ) : null}

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Nhận thông tin ưu đãi sớm nhất
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-ink-soft">
              Để lại số điện thoại để được thông báo ngay khi VinFast công bố chương
              trình ưu đãi mới hoặc ra mắt mẫu xe mới tại Đà Nẵng.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <LeadForm source="news" />
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          itemListSchema(
            posts.map((post) => ({
              name: post.title,
              href: `/${post.slug}`,
              image: post.coverImage,
            })),
            "Tin tức xe điện VinFast",
          ),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Tin tức", href: "/tin-tuc" },
          ]),
        )}
      />
    </>
  );
}
