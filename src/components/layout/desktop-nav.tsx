"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { BuyLink, NavCarGroup } from "@/components/layout/nav-types";

interface DesktopNavProps {
  carGroups: NavCarGroup[];
  buyLinks: BuyLink[];
}

const simpleLinks = [
  { label: "Trang Chủ", href: "/" },
  { label: "Giới Thiệu", href: "/gioi-thieu" },
  { label: "Bảng Giá", href: "/bang-gia-xe" },
];

const tailLinks = [
  { label: "Tin Tức", href: "/tin-tuc" },
  { label: "Liên Hệ", href: "/lien-he" },
];

export function DesktopNav({ carGroups, buyLinks }: DesktopNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    cn(
      "relative rounded-lg px-3 py-2 text-[14.5px] font-semibold transition-colors",
      active
        ? "text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent-orange"
        : "text-white/75 hover:text-white",
    );

  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden flex-1 items-center justify-center lg:flex"
      onMouseLeave={() => setOpen(null)}
    >
      <ul className="flex items-center gap-0.5">
        {simpleLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          </li>
        ))}

        {carGroups.map((group) => (
          <li
            key={group.label}
            className="static"
            onMouseEnter={() => setOpen(group.label)}
          >
            <button
              type="button"
              aria-expanded={open === group.label}
              aria-haspopup="true"
              onClick={() => setOpen(open === group.label ? null : group.label)}
              className={cn(linkClass(false), "inline-flex items-center gap-1")}
            >
              {group.label}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  open === group.label && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {open === group.label ? (
              <div className="absolute inset-x-0 top-full z-50 pt-2">
                <div className="container-site">
                  <div className="rounded-2xl border border-border bg-popover p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
                    <div className="mb-4 flex items-baseline justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                        {group.label}
                      </p>
                      <Link
                        href="/bang-gia-xe"
                        className="text-xs font-semibold text-ink-soft hover:text-brand"
                        onClick={() => setOpen(null)}
                      >
                        Xem bảng giá đầy đủ →
                      </Link>
                    </div>
                    <ul className="grid grid-cols-4 gap-2.5">
                      {group.items.map((car) => (
                        <li key={car.slug}>
                          <Link
                            href={`/xe/${car.slug}`}
                            onClick={() => setOpen(null)}
                            className="group flex flex-col gap-2 rounded-xl border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/60"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={car.image}
                                alt={car.name}
                                fill
                                sizes="220px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink group-hover:text-brand">
                                {car.name}
                              </p>
                              <p className="text-xs text-ink-soft">
                                Giá từ {car.price}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </li>
        ))}

        <li className="relative" onMouseEnter={() => setOpen("mua-xe")}>
          <button
            type="button"
            aria-expanded={open === "mua-xe"}
            aria-haspopup="true"
            onClick={() => setOpen(open === "mua-xe" ? null : "mua-xe")}
            className={cn(linkClass(false), "inline-flex items-center gap-1")}
          >
            Mua Xe
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                open === "mua-xe" && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {open === "mua-xe" ? (
            <div className="absolute left-0 top-full z-50 w-72 pt-2">
              <ul className="rounded-2xl border border-border bg-popover p-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
                {buyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(null)}
                      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                    >
                      <span className="block text-sm font-semibold text-ink">
                        {link.label}
                      </span>
                      {link.description ? (
                        <span className="block text-xs text-ink-soft">
                          {link.description}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </li>

        {tailLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
