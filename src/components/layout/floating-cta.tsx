"use client";

import { Phone, MessageCircle, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PHONE_HREF, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FloatingCta() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Thanh CTA cố định cho mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2 p-2.5">
          <a
            href={PHONE_HREF}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-orange px-3 py-3 text-sm font-bold text-white"
          >
            <Phone className="size-4" aria-hidden />
            Gọi ngay
          </a>
          <a
            href={site.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-3 text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" aria-hidden />
            Chat Zalo
          </a>
        </div>
      </div>

      {/* Nút nổi desktop - thu gọn thành icon, mở rộng khi hover */}
      <div className="fixed bottom-6 left-5 z-40 hidden flex-col gap-3 md:flex">
        <a
          href={PHONE_HREF}
          aria-label={`Gọi ${site.hotline} - ưu đãi thêm 50 triệu`}
          className="group flex items-center rounded-full bg-accent-orange text-white shadow-lg transition-all hover:brightness-110"
        >
          <span className="relative inline-flex size-13 shrink-0 items-center justify-center rounded-full">
            <span
              className="absolute inset-2 animate-ping rounded-full bg-white/25"
              aria-hidden
            />
            <Phone className="relative size-5" aria-hidden />
          </span>
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 group-hover:grid-cols-[1fr]">
            <span className="overflow-hidden">
              <span className="block whitespace-nowrap pr-5 text-sm font-bold leading-tight">
                {site.hotline}
                <span className="block text-[11px] font-medium opacity-90">
                  Ưu đãi thêm 50TR
                </span>
              </span>
            </span>
          </span>
        </a>

        <a
          href={site.zalo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo với VinFast Đà Nẵng"
          className="group flex items-center rounded-full bg-brand text-white shadow-lg transition-all hover:brightness-110"
        >
          <span className="inline-flex size-13 shrink-0 items-center justify-center rounded-full">
            <MessageCircle className="size-5" aria-hidden />
          </span>
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 group-hover:grid-cols-[1fr]">
            <span className="overflow-hidden">
              <span className="block whitespace-nowrap pr-5 text-sm font-bold">
                Chat Zalo
              </span>
            </span>
          </span>
        </a>
      </div>

      <button
        type="button"
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-24 right-5 z-40 inline-flex size-11 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-all md:bottom-6",
          showTop ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
    </>
  );
}
