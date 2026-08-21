"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PHONE_HREF, site } from "@/lib/site";
import type { BuyLink, NavCarGroup } from "@/components/layout/nav-types";

interface MobileNavProps {
  carGroups: NavCarGroup[];
  buyLinks: BuyLink[];
}

export function MobileNav({ carGroups, buyLinks }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  /** Đóng sheet khi bấm vào bất kỳ liên kết điều hướng nào. */
  const closeOnLink = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a[href]")) setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-left text-base">Danh mục</SheetTitle>
        </SheetHeader>

        <nav
          aria-label="Điều hướng di động"
          className="px-4 py-3"
          onClick={closeOnLink}
        >
          <ul className="space-y-1 text-[15px] font-semibold text-ink">
            <li>
              <Link href="/" className="block rounded-lg px-2 py-2.5 hover:bg-muted">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link href="/gioi-thieu" className="block rounded-lg px-2 py-2.5 hover:bg-muted">
                Giới Thiệu
              </Link>
            </li>
            <li>
              <Link href="/bang-gia-xe" className="block rounded-lg px-2 py-2.5 hover:bg-muted">
                Bảng Giá
              </Link>
            </li>
          </ul>

          <Accordion className="mt-1">
            {carGroups.map((group) => (
              <AccordionItem key={group.label} value={group.label}>
                <AccordionTrigger className="px-2 text-[15px] font-semibold">
                  {group.label}
                </AccordionTrigger>
                <AccordionContent className="px-2">
                  <ul className="space-y-1.5">
                    {group.items.map((car) => (
                      <li key={car.slug}>
                        <Link
                          href={`/xe/${car.slug}`}
                          className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                        >
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={car.image}
                              alt={car.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink">
                              {car.name}
                            </span>
                            <span className="block text-xs text-ink-soft">
                              Giá từ {car.price}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="mua-xe">
              <AccordionTrigger className="px-2 text-[15px] font-semibold">
                Mua Xe
              </AccordionTrigger>
              <AccordionContent className="px-2">
                <ul className="space-y-1">
                  {buyLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-2 py-2 text-sm font-medium text-ink hover:bg-muted"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <ul className="mt-1 space-y-1 text-[15px] font-semibold text-ink">
            <li>
              <Link href="/tin-tuc" className="block rounded-lg px-2 py-2.5 hover:bg-muted">
                Tin Tức
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="block rounded-lg px-2 py-2.5 hover:bg-muted">
                Liên Hệ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sticky bottom-0 border-t border-border bg-background p-4">
          <a
            href={PHONE_HREF}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-orange px-4 py-3 text-sm font-bold text-white"
          >
            <Phone className="size-4" aria-hidden />
            Gọi ngay {site.hotline}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
