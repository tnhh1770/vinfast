"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface HeroSlide {
  image: string;
  alt: string;
  href: string;
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((index: number) => embla?.scrollTo(index), [embla]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    embla.on("select", onSelect);

    const timer = window.setInterval(() => embla.scrollNext(), 5000);
    const stop = () => window.clearInterval(timer);
    embla.on("pointerDown", stop);

    return () => {
      window.clearInterval(timer);
      embla.off("select", onSelect);
    };
  }, [embla]);

  if (!slides.length) return null;

  return (
    <section aria-label="Chương trình nổi bật" className="relative bg-muted">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.image} className="relative min-w-0 flex-[0_0_100%]">
              <Link href={slide.href} className="block">
                <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[2.6/1]">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Slide trước"
        onClick={() => embla?.scrollPrev()}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-ink shadow-md transition hover:bg-white sm:inline-flex"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Slide kế tiếp"
        onClick={() => embla?.scrollNext()}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-ink shadow-md transition hover:bg-white sm:inline-flex"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`Đi tới slide ${index + 1}`}
            aria-current={selected === index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              selected === index ? "w-7 bg-white" : "w-3 bg-white/55",
            )}
          />
        ))}
      </div>
    </section>
  );
}
