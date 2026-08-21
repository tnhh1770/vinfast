import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, RefreshCcw } from "lucide-react";

import { ContentBlocks } from "@/components/car/content-blocks";
import { PostCard } from "@/components/news/post-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getPost, getPosts, getStaticPage, getStaticPages } from "@/lib/repo";
import { formatDateVi, truncate } from "@/lib/format";
import { legalLinks, site } from "@/lib/site";
import { articleSchema, breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const [posts, pages] = await Promise.all([getPosts(), getStaticPages()]);
  return [...posts, ...pages].map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);
  if (post) {
    const meta = buildMetadata({
      title: post.title,
      description: post.excerpt || truncate(post.title, 160),
      path: `/${post.slug}`,
      image: post.coverImage,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    });
    // Tiêu đề đã dài thì bỏ hậu tố "| VinFast Đà Nẵng" để không bị Google cắt.
    if (post.title.length > 52) meta.title = { absolute: post.title };
    return meta;
  }

  const page = await getStaticPage(slug);
  if (page) {
    const firstText = page.blocks.find(
      (block) => block.type === "paragraph",
    ) as { text?: string; html?: string } | undefined;
    return buildMetadata({
      title: page.title,
      description: truncate(
        firstText?.text || firstText?.html || `${page.title} - ${site.name}`,
        180,
      ),
      path: `/${page.slug}`,
    });
  }

  return { title: "Không tìm thấy trang" };
}

export default async function DynamicSlugPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;

  const post = await getPost(slug);
  if (post) return <ArticleView slug={slug} />;

  const page = await getStaticPage(slug);
  if (!page) notFound();

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: page.title, href: `/${page.slug}` }]} />
      </div>

      <div className="container-site grid gap-10 py-8 pb-16 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            {page.title}
          </h1>
          {page.updatedAt ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
              <RefreshCcw className="size-3.5" aria-hidden />
              Cập nhật lần cuối:{" "}
              <time dateTime={page.updatedAt}>{formatDateVi(page.updatedAt)}</time>
            </p>
          ) : null}
          <div className="mt-3 h-1 w-16 rounded-full bg-brand" aria-hidden />
          <ContentBlocks blocks={page.blocks} className="mt-7" />
        </article>

        <aside className="lg:sticky lg:top-[7.5rem] lg:h-fit">
          <nav
            aria-label="Các chính sách khác"
            className="rounded-2xl border border-border bg-card p-5"
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-soft">
              Chính sách khác
            </h2>
            <ul className="mt-4 space-y-2 text-[14px]">
              {legalLinks
                .filter((link) => link.href !== `/${page.slug}`)
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-2 py-1.5 text-ink-soft transition hover:bg-muted hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="mt-5 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-extrabold text-ink">Cần hỗ trợ?</h2>
            <div className="mt-4">
              <LeadForm source={`page-${page.slug}`} />
            </div>
          </div>
        </aside>
      </div>

      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: page.title, href: `/${page.slug}` },
          ]),
        )}
      />
    </>
  );
}

async function ArticleView({ slug }: { slug: string }) {
  const [post, allPosts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const headings = post.blocks.filter(
    (block): block is Extract<typeof block, { type: "heading" }> =>
      block.type === "heading" && Boolean(block.text),
  );

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs
          items={[
            { name: "Tin tức", href: "/tin-tuc" },
            { name: post.title, href: `/${post.slug}` },
          ]}
        />
      </div>

      <div className="container-site grid gap-10 py-8 pb-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <header>
            <p className="inline-flex rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand">
              {post.category}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-ink sm:text-[40px]">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
              <time
                dateTime={post.publishedAt}
                className="inline-flex items-center gap-1.5"
              >
                <CalendarDays className="size-4" aria-hidden />
                {formatDateVi(post.publishedAt)}
              </time>
              <span>·</span>
              <span>{site.name}</span>
            </div>
          </header>

          {post.coverImage ? (
            <figure className="mt-6 overflow-hidden rounded-2xl bg-muted">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={675}
                priority
                sizes="(max-width: 1024px) 100vw, 760px"
                className="h-auto w-full object-cover"
              />
            </figure>
          ) : null}

          {headings.length > 1 ? (
            <nav
              aria-label="Mục lục bài viết"
              className="mt-7 rounded-2xl border border-border bg-muted/40 p-5"
            >
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-soft">
                Nội dung chính
              </h2>
              <ol className="mt-3 space-y-1.5 text-[14px]">
                {headings.map((heading, index) => (
                  <li key={index} className="text-ink-soft">
                    <span className="mr-1.5 font-bold text-brand">{index + 1}.</span>
                    {heading.text}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <ContentBlocks
            blocks={post.blocks}
            imageAltPrefix={post.title}
            className="mt-7"
          />
        </article>

        <aside className="lg:sticky lg:top-[7.5rem] lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-ink">
              Nhận tư vấn &amp; báo giá
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Để lại thông tin để nhận bảng giá lăn bánh và ưu đãi mới nhất.
            </p>
            <div className="mt-4">
              <LeadForm source={`post-${post.slug}`} withCarField />
            </div>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section aria-labelledby="bai-viet-lien-quan" className="bg-muted/50 py-14">
          <div className="container-site">
            <h2
              id="bai-viet-lien-quan"
              className="text-2xl font-extrabold text-ink sm:text-3xl"
            >
              Bài viết liên quan
            </h2>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={graph(
          articleSchema(post),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Tin tức", href: "/tin-tuc" },
            { name: post.title, href: `/${post.slug}` },
          ]),
        )}
      />
    </>
  );
}
