"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Gift } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "xe-vinfast", label: "Xe VinFast" },
  { key: "xe-dich-vu", label: "Xe Dịch Vụ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function PriceTableGrid({ cars }: { cars: Car[] }) {
  const [tab, setTab] = useState<TabKey>("all");
  const filtered = useMemo(
    () => (tab === "all" ? cars : cars.filter((car) => car.group === tab)),
    [cars, tab],
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Lọc bảng giá theo nhóm xe"
        className="mx-auto mb-7 flex w-fit gap-1 rounded-full bg-muted p-1"
      >
        {TABS.map((item) => (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-4 py-2 text-[13.5px] font-semibold transition sm:px-5",
              tab === item.key
                ? "bg-background text-brand shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((car, index) => (
          <li key={car.slug}>
            <PriceCard car={car} priority={index < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceCard({ car, priority }: { car: Car; priority?: boolean }) {
  const [promoIdx, setPromoIdx] = useState<number[]>([]);

  const { percentTotal, fixedTotal } = useMemo(() => {
    const percent = promoIdx.reduce(
      (sum, i) => sum + (car.promotions[i]?.percent ?? 0),
      0,
    );
    const fixed = promoIdx.reduce(
      (sum, i) => sum + (car.promotions[i]?.fixed ?? 0),
      0,
    );
    return { percentTotal: percent, fixedTotal: fixed };
  }, [car.promotions, promoIdx]);

  const active = percentTotal > 0 || fixedTotal > 0;
  const priceAfter = (base: number) =>
    Math.max(0, base - ((base * percentTotal) / 100 + fixedTotal));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/xe/${car.slug}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-white">
          <Image
            src={car.thumbnail || car.heroImage}
            alt={`Giá xe ${car.name} tại VinFast Đà Nẵng`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="px-4 pt-4 text-lg font-bold text-ink transition-colors group-hover:text-brand">
          {car.name}
        </h3>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <ul className="space-y-2">
          {car.versions.map((version) => (
            <li
              key={version.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5"
            >
              <span className="text-[13px] font-semibold text-ink">
                {version.name}
              </span>
              <span className="text-right">
                <span
                  className={cn(
                    "block text-sm font-bold text-accent-red",
                    active && "text-xs font-normal text-ink-soft line-through",
                  )}
                >
                  {formatNumber(version.price)} đ
                </span>
                {active ? (
                  <span className="block text-sm font-bold text-accent-red">
                    {formatNumber(priceAfter(version.price))} đ
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        {car.promotions.length ? (
          <fieldset className="relative rounded-xl border-[1.5px] border-accent-orange/70 px-3 pb-3 pt-5">
            <legend className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-accent-orange px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
              <Gift className="size-3" aria-hidden />
              Ưu đãi
            </legend>
            <div className="grid gap-1.5">
              {car.promotions.map((promo, index) => (
                <label
                  key={promo.name}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition",
                    promoIdx.includes(index)
                      ? "border-accent-orange bg-accent-orange/10 text-accent-orange"
                      : "border-border bg-background text-ink hover:border-accent-orange/40",
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-3.5 accent-[var(--accent-orange)]"
                    checked={promoIdx.includes(index)}
                    onChange={() =>
                      setPromoIdx((prev) =>
                        prev.includes(index)
                          ? prev.filter((i) => i !== index)
                          : [...prev, index],
                      )
                    }
                  />
                  <span className="flex-1">{promo.name}</span>
                  <span className="font-bold">{promo.badge}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <p className="mt-auto rounded-xl bg-brand px-3.5 py-2.5 text-center text-[12.5px] font-semibold uppercase tracking-wide text-white">
          Mua trả góp chỉ từ{" "}
          <strong className="text-sm font-extrabold">{car.installmentText}</strong>
        </p>
      </div>
    </article>
  );
}
