"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

export function YoutubeEmbed({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Phát video: ${title}`}
          className="group absolute inset-0 size-full"
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent-red text-white shadow-lg transition-transform group-hover:scale-110">
              <Play className="size-7 fill-current" aria-hidden />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
