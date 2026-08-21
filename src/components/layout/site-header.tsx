import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";

import { getCarsByGroup } from "@/lib/repo";
import { PHONE_HREF, buyLinks, site } from "@/lib/site";
import { formatVnd } from "@/lib/format";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { NavCarItem } from "@/components/layout/nav-types";

export async function SiteHeader() {
  const [vinfastCars, serviceCars] = await Promise.all([
    getCarsByGroup("xe-vinfast"),
    getCarsByGroup("xe-dich-vu"),
  ]);

  const toNavItem = (car: {
    slug: string;
    name: string;
    heroImage: string;
    thumbnail: string;
    price: number;
    nedc: string;
    category: string;
  }): NavCarItem => ({
    slug: car.slug,
    name: car.name,
    image: car.thumbnail || car.heroImage,
    price: formatVnd(car.price),
    nedc: car.nedc,
    category: car.category,
  });

  const carGroups = [
    { label: "Xe VinFast", items: vinfastCars.map(toNavItem) },
    { label: "Xe Dịch Vụ", items: serviceCars.map(toNavItem) },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f18]/95 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-[#0b0f18]/85">
      <div className="hidden border-b border-white/10 lg:block">
        <div className="container-site flex h-9 items-center justify-between text-[13px] text-white/70">
          <p className="font-medium">
            Đại lý chính hãng · Giao xe toàn Miền Trung · Hỗ trợ trả góp đến 85%
          </p>
          <div className="flex items-center gap-5">
            <span>{site.address}</span>
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline"
            >
              <Phone className="size-3.5" aria-hidden />
              {site.hotline}
            </a>
          </div>
        </div>
      </div>

      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[74px]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={`${site.name} - trang chủ`}
        >
          <Image
            src={site.logo}
            alt={`Logo ${site.name}`}
            width={569}
            height={111}
            priority
            sizes="(max-width: 1024px) 150px, 190px"
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <DesktopNav carGroups={carGroups} buyLinks={buyLinks} />

        <div className="flex items-center gap-2">
          <a
            href={PHONE_HREF}
            className="hidden items-center gap-2 rounded-full bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:inline-flex"
          >
            <Phone className="size-4" aria-hidden />
            {site.hotline}
          </a>
          <MobileNav carGroups={carGroups} buyLinks={buyLinks} />
        </div>
      </div>
    </header>
  );
}
