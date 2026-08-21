"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "ngoaithat", label: "Ngoại thất", short: "Thiết kế" },
  { id: "noithat", label: "Nội thất", short: "Nội thất" },
  { id: "vanhanh", label: "Vận hành", short: "Vận hành" },
  { id: "antoan", label: "An toàn", short: "An toàn" },
  { id: "tskt", label: "Thông số", short: "Thông số" },
  { id: "anh", label: "Hình ảnh", short: "Hình ảnh" },
];

export function CarSectionNav({ available }: { available: string[] }) {
  const items = SECTIONS.filter((section) => available.includes(section.id));
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    items.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav
      aria-label="Nội dung bài viết xe"
      className="sticky top-16 z-30 border-y border-border bg-background/92 backdrop-blur lg:top-[110px]"
    >
      <div className="container-site">
        <ul className="-mx-1 flex snap-x items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((section) => (
            <li key={section.id} className="snap-start">
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className={cn(
                  "inline-block whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors",
                  active === section.id
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:bg-muted hover:text-ink",
                )}
              >
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{section.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
