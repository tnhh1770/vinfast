import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostCard } from "@/components/news/post-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { getPosts } from "@/lib/repo";
import { breadcrumbSchema, buildMetadata, graph, itemListSchema } from "@/lib/seo";

export const revalidate = 1800;

export async function generateStaticParams() {
  const posts = await getPosts();
  return [...new Set(posts.map((post) => post.categorySlug))].map((slug) => ({ slug }));
}

async function getCategory(slug: string) {
  const posts = await getPosts();
  const filtered = posts.filter((post) => post.categorySlug === slug);
  if (!filtered.length) return null;
  return { name: filtered[0].category, posts: filtered };
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Không tìm thấy chuyên mục" };

  return buildMetadata({
    title: `${category.name} - Tin tức xe điện VinFast`,
    description: `Tổng hợp ${category.posts.length} bài viết thuộc chuyên mục ${category.name} về xe điện VinFast tại VinFast Đà Nẵng.`,
    path: `/category/${slug}`,
    image: category.posts[0]?.coverImage,
  });
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs
          items={[
            { name: "Tin tức", href: "/tin-tuc" },
            { name: category.name, href: `/category/${slug}` },
          ]}
        />
      </div>

      <section className="container-site py-10 pb-16 sm:py-12">
        <SectionHeading
          eyebrow="Chuyên mục"
          title={category.name}
          description={`${category.posts.length} bài viết trong chuyên mục này.`}
        />
        <h1 className="sr-only">Chuyên mục {category.name}</h1>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.posts.map((post, index) => (
            <li key={post.slug}>
              <PostCard post={post} priority={index < 3} />
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={graph(
          itemListSchema(
            category.posts.map((post) => ({
              name: post.title,
              href: `/${post.slug}`,
              image: post.coverImage,
            })),
            category.name,
          ),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Tin tức", href: "/tin-tuc" },
            { name: category.name, href: `/category/${slug}` },
          ]),
        )}
      />
    </>
  );
}
