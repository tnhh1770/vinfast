import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Phone, Wrench } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { aboutContent, PHONE_HREF, site } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: aboutContent.seo.title,
  description: aboutContent.seo.description,
  path: "/gioi-thieu",
  image: aboutContent.images[0],
  keywords: ["giới thiệu vinfast đà nẵng", "showroom vinfast hải châu", "đại lý vinfast đà nẵng"],
});

const TAB_ICONS = [MapPin, Wrench, Phone];

export default function AboutPage() {
  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Giới thiệu", href: "/gioi-thieu" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Về đại lý"
          title={aboutContent.heading}
          align="left"
        />
        <h1 className="sr-only">Giới thiệu {site.name}</h1>
        <p className="mt-6 max-w-4xl text-[15px] leading-8 text-ink-soft">
          {aboutContent.intro}
        </p>

        <ul className="mt-9 grid gap-4 sm:grid-cols-3">
          {aboutContent.images.map((src, index) => (
            <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={src}
                alt={`Showroom ${site.name} - hình ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 92vw, 380px"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="prose-vi space-y-5">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Phòng trưng bày &amp; xưởng dịch vụ tiêu chuẩn VinFast 3S
            </h2>
            {aboutContent.paragraphs.map((text, index) => (
              <p key={index} className="leading-8 text-ink-soft">
                {text}
              </p>
            ))}
          </div>

          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted lg:aspect-auto">
            <Image
              src={aboutContent.sideImage}
              alt={`Khu vực tiếp khách tại ${site.name}`}
              fill
              sizes="(max-width: 1024px) 92vw, 420px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-site py-14">
        <SectionHeading
          eyebrow="Lý do chọn chúng tôi"
          title="Giá trị VinFast Đà Nẵng mang lại"
        />
        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {aboutContent.tabs.map((tab, index) => {
            const Icon = TAB_ICONS[index] ?? MapPin;
            return (
              <li
                key={tab.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{tab.title}</h3>
                <p className="mt-2 text-[14.5px] leading-7 text-ink-soft">{tab.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-brand py-12 text-white">
        <div className="container-site grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Ghé thăm showroom VinFast Đà Nẵng
            </h2>
            <p className="mt-3 text-white/85">{site.address}</p>
            <a
              href={PHONE_HREF}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-brand transition hover:bg-white/90"
            >
              <Phone className="size-4" aria-hidden />
              {site.hotline}
            </a>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <LeadForm source="about" tone="dark" withCarField />
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Giới thiệu", href: "/gioi-thieu" },
          ]),
        )}
      />
    </>
  );
}
