"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BatteryCharging, Gift, Phone, Settings2 } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { PHONE_HREF, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

export function CarHero({ car }: { car: Car }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [optionIdx, setOptionIdx] = useState<number[]>([]);
  const [promoIdx, setPromoIdx] = useState<number[]>([]);

  const activeImage =
    car.colors[colorIndex]?.image || car.heroImage || car.ogImage || "";

  const { optionsTotal, percentTotal, fixedTotal } = useMemo(() => {
    const opts = optionIdx.reduce(
      (sum, i) => sum + (car.options[i]?.price ?? 0),
      0,
    );
    const percent = promoIdx.reduce(
      (sum, i) => sum + (car.promotions[i]?.percent ?? 0),
      0,
    );
    const fixed = promoIdx.reduce(
      (sum, i) => sum + (car.promotions[i]?.fixed ?? 0),
      0,
    );
    return { optionsTotal: opts, percentTotal: percent, fixedTotal: fixed };
  }, [car.options, car.promotions, optionIdx, promoIdx]);

  const hasSelection = optionsTotal > 0 || percentTotal > 0 || fixedTotal > 0;

  const finalPrice = (base: number) => {
    const withOptions = base + optionsTotal;
    const discount = (withOptions * percentTotal) / 100 + fixedTotal;
    return Math.max(0, base - discount + optionsTotal);
  };

  const toggle = (
    list: number[],
    setList: (next: number[]) => void,
    index: number,
  ) => {
    setList(
      list.includes(index) ? list.filter((i) => i !== index) : [...list, index],
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/70 to-background">
      <div className="container-site grid gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
        {/* Ảnh + chọn màu */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border">
            {activeImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt={`${car.name} - màu xe ${colorIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-contain p-3 transition-opacity duration-300"
              />
            ) : null}
            {car.category ? (
              <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                {car.category}
              </span>
            ) : null}
          </div>

          {car.colors.length > 1 ? (
            <div className="mt-4">
              <p className="mb-2 text-[13px] font-semibold text-ink">
                Màu xe ({car.colors.length} lựa chọn)
              </p>
              <div className="flex flex-wrap gap-2.5">
                {car.colors.map((color, index) => (
                  <button
                    key={`${color.hex}-${index}`}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    aria-label={`Xem ${car.name} màu ${index + 1}`}
                    aria-pressed={colorIndex === index}
                    className={cn(
                      "size-9 rounded-full p-[3px] ring-2 transition",
                      colorIndex === index
                        ? "ring-brand"
                        : "ring-border hover:ring-brand/50",
                    )}
                  >
                    <span
                      className="block size-full rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Thông tin + giá */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
              {car.name}
            </h1>
            {car.nedc ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1.5 text-[13px] font-bold text-emerald-700">
                <BatteryCharging className="size-3.5" aria-hidden />
                NEDC {car.nedc}
              </span>
            ) : null}
          </div>

          {/* Bảng giá phiên bản */}
          <ul className="mt-5 space-y-2">
            {car.versions.map((version) => {
              const next = finalPrice(version.price);
              return (
                <li
                  key={version.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="text-sm font-semibold text-ink">
                    {version.name}
                  </span>
                  <span className="text-right">
                    <span
                      className={cn(
                        "block font-bold text-accent-red transition-all",
                        hasSelection &&
                          "text-[13px] font-normal text-ink-soft line-through",
                      )}
                    >
                      {formatNumber(version.price)} đ
                    </span>
                    {hasSelection ? (
                      <span className="block font-bold text-accent-red">
                        {formatNumber(next)} đ
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Tùy chọn thêm */}
          {car.options.length ? (
            <fieldset className="relative mt-4 rounded-xl border-[1.5px] border-brand/70 px-3.5 pb-3.5 pt-5">
              <legend className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Settings2 className="size-3" aria-hidden />
                Tùy chọn thêm
              </legend>
              <div className="flex flex-wrap gap-2">
                {car.options.map((option, index) => (
                  <label
                    key={option.name}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                      optionIdx.includes(index)
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-background text-ink hover:border-brand/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--brand)]"
                      checked={optionIdx.includes(index)}
                      onChange={() => toggle(optionIdx, setOptionIdx, index)}
                    />
                    {option.name}
                    <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-bold text-brand">
                      {option.badge}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {/* Ưu đãi */}
          {car.promotions.length ? (
            <fieldset className="relative mt-4 rounded-xl border-[1.5px] border-accent-orange/70 px-3.5 pb-3.5 pt-5">
              <legend className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-accent-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Gift className="size-3" aria-hidden />
                Ưu đãi
              </legend>
              <div className="grid gap-2">
                {car.promotions.map((promo, index) => (
                  <label
                    key={promo.name}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                      promoIdx.includes(index)
                        ? "border-accent-orange bg-accent-orange/10 text-accent-orange"
                        : "border-border bg-background text-ink hover:border-accent-orange/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--accent-orange)]"
                      checked={promoIdx.includes(index)}
                      onChange={() => toggle(promoIdx, setPromoIdx, index)}
                    />
                    <span className="flex-1">{promo.name}</span>
                    <span className="rounded-full bg-accent-orange/15 px-2 py-0.5 text-[11px] font-bold text-accent-orange">
                      {promo.badge}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <p className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand/80 px-4 py-3 text-[13px] font-medium uppercase tracking-wide text-white">
            Mua xe trả góp chỉ từ
            <strong className="text-[15px] font-extrabold">
              {car.installmentText}
            </strong>
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="#tinh-phi"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Nhận giá lăn bánh tốt nhất
            </a>
            <a
              href={PHONE_HREF}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-orange px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <Phone className="size-4" aria-hidden />
              {site.hotline}
            </a>
          </div>
          <p className="mt-2 text-center text-[12.5px] text-ink-soft">
            Gọi Hotline sẽ có giá tốt #1
          </p>
        </div>
      </div>
    </section>
  );
}
