"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";

export function ShowroomGallery({ images }: { images: string[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  useEffect(() => {
    if (!embla) return;
    const timer = window.setInterval(() => embla.scrollNext(), 3500);
    return () => window.clearInterval(timer);
  }, [embla]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <ul className="flex gap-3">
        {images.map((src, index) => (
          <li
            key={src}
            className="min-w-0 flex-[0_0_50%] sm:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={src}
                alt={`Showroom VinFast Đà Nẵng - hình ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
