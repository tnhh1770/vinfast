import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Gift, Wallet } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

/** Tổng ưu đãi tối đa = (tổng % + tiền mặt) áp trên giá bản thấp nhất. */
export function maxDiscount(car: Car): number {
  const percent = car.promotions.reduce((sum, p) => sum + p.percent, 0);
  const fixed = car.promotions.reduce((sum, p) => sum + p.fixed, 0);
  return Math.round((car.price * percent) / 100 + fixed);
}

export function CarCard({
  car,
  priority = false,
}: {
  car: Car;
  priority?: boolean;
}) {
  const discount = maxDiscount(car);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)]">
      <Link href={`/xe/${car.slug}`} className="relative block aspect-[16/11] overflow-hidden bg-white">
        <Image
          src={car.thumbnail || car.heroImage}
          alt={`${car.name} - ${car.category || "xe điện VinFast"} tại VinFast Đà Nẵng`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {car.category ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {car.category}
          </span>
        ) : null}
        {car.nedc ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            <BatteryCharging className="size-3" aria-hidden />
            {car.nedc}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] font-bold leading-snug text-ink">
          <Link href={`/xe/${car.slug}`} className="transition-colors hover:text-brand">
            {car.name}
          </Link>
        </h3>

        <dl className="mt-3 space-y-1.5 text-[13.5px]">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-ink-soft">Giá từ</dt>
            <dd className="text-[17px] font-extrabold text-accent-red">
              {formatNumber(car.price)} ₫
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="inline-flex items-center gap-1.5 text-ink-soft">
              <Wallet className="size-3.5" aria-hidden />
              Trả góp từ
            </dt>
            <dd className="font-semibold text-ink">{car.installmentText}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex items-baseline justify-between gap-2">
              <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                <Gift className="size-3.5 text-accent-orange" aria-hidden />
                Ưu đãi đến
              </dt>
              <dd className="font-bold text-accent-orange">
                {formatNumber(discount)} đ
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-2 text-[11.5px] leading-5 text-ink-soft">
          (Áp dụng tất cả các ưu đãi hiện hành)
        </p>

        <Link
          href={`/xe/${car.slug}`}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center rounded-xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm font-bold text-brand transition",
            "hover:bg-brand hover:text-white",
          )}
        >
          Xem chi tiết &amp; giá lăn bánh
        </Link>
      </div>
    </article>
  );
}
