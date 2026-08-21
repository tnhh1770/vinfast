"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface CarGalleryProps {
  images: { src: string; alt?: string }[];
  name: string;
}

export function CarGallery({ images, name }: CarGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null
          ? current
          : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, move]);

  if (!images.length) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted"
              aria-label={`Xem ảnh ${index + 1} của ${name}`}
            >
              <Image
                src={image.src}
                alt={image.alt || `${name} - ảnh ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Thư viện ảnh ${name}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            className="absolute left-3 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ảnh kế tiếp"
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            className="absolute right-3 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>

          <figure
            className="relative max-h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[open].src}
              alt={images[open].alt || `${name} - ảnh ${open + 1}`}
              width={1600}
              height={1067}
              sizes="90vw"
              className="mx-auto h-auto max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/75">
              {open + 1} / {images.length}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
