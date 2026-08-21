import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";

import { formatDateVi } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

export function PostCard({
  post,
  variant = "vertical",
  priority = false,
}: {
  post: Post;
  variant?: "vertical" | "horizontal";
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)]",
        variant === "vertical" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <Link
        href={`/${post.slug}`}
        className={cn(
          "relative block overflow-hidden bg-muted",
          variant === "vertical" ? "aspect-[16/10]" : "aspect-[16/10] sm:w-56 sm:shrink-0",
        )}
        tabIndex={-1}
        aria-hidden
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3 text-[12px] font-medium text-ink-soft">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 font-bold uppercase tracking-wide text-brand">
            {post.category}
          </span>
          <time
            dateTime={post.publishedAt}
            className="inline-flex items-center gap-1.5"
          >
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDateVi(post.publishedAt)}
          </time>
        </div>

        <h3 className="mt-2.5 text-[16px] font-bold leading-snug text-ink">
          <Link href={`/${post.slug}`} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 text-[13.5px] leading-6 text-ink-soft">
          {post.excerpt}
        </p>

        <Link
          href={`/${post.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-bold text-brand transition-colors hover:text-brand-dark"
        >
          Xem thêm
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
