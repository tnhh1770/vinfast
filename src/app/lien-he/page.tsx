import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { FacebookIcon } from "@/components/shared/brand-icons";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { PHONE_HREF, site } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Liên Hệ VinFast Đà Nẵng - Địa Chỉ & Hotline",
  description: `Liên hệ đại lý ${site.name}: ${site.address}. Hotline ${site.hotline}, email ${site.email}. Tư vấn mua xe, trả góp, lái thử và dịch vụ hậu mãi.`,
  path: "/lien-he",
  keywords: ["liên hệ vinfast đà nẵng", "địa chỉ vinfast đà nẵng", "hotline vinfast đà nẵng"],
});

const MAP_QUERY = encodeURIComponent("115 Nguyễn Văn Linh, Hải Châu, Đà Nẵng");

export default function ContactPage() {
  const cards = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: site.address,
      href: `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`,
    },
    { icon: Phone, title: "Hotline", value: site.hotline, href: PHONE_HREF },
    { icon: Mail, title: "Email", value: site.email, href: `mailto:${site.email}` },
    {
      icon: Clock,
      title: "Giờ làm việc",
      value: "Thứ 2 - Chủ nhật: 07:30 - 21:00",
    },
  ];

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Liên hệ", href: "/lien-he" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Liên hệ"
          title={site.name}
          description="Đội ngũ tư vấn sẵn sàng hỗ trợ bạn 24/7 về giá xe, thủ tục trả góp, lịch lái thử và dịch vụ bảo hành bảo dưỡng."
        />
        <h1 className="sr-only">Liên hệ {site.name}</h1>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Inner = (
              <>
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <card.icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {card.title}
                </h2>
                <p className="mt-1.5 text-[15px] font-semibold leading-6 text-ink">
                  {card.value}
                </p>
              </>
            );
            return (
              <li
                key={card.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-brand/40"
              >
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    {Inner}
                  </a>
                ) : (
                  Inner
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <iframe
              title={`Bản đồ đường đi tới ${site.name}`}
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full border-0"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink">Tư vấn nhanh</h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Để lại thông tin, chúng tôi sẽ gọi lại trong ít phút.
            </p>
            <div className="mt-5">
              <LeadForm source="contact" withCarField withMessage />
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={site.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                <MessageCircle className="size-4" aria-hidden />
                Chat Zalo
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
              >
                <FacebookIcon className="size-4" aria-hidden />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Liên hệ", href: "/lien-he" },
          ]),
        )}
      />
    </>
  );
}
