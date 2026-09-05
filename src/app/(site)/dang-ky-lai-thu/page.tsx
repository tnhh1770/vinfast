import Image from "next/image";
import type { Metadata } from "next";
import { CalendarClock, Car, Home, Phone } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getCars } from "@/lib/repo";
import { PHONE_HREF, site, testDriveContent } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, graph } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: testDriveContent.seo.title,
  description: testDriveContent.seo.description,
  path: "/dang-ky-lai-thu",
  image: testDriveContent.image,
  keywords: ["đăng ký lái thử vinfast", "lái thử xe vinfast đà nẵng", "lái thử tại nhà"],
});

const STEPS = [
  {
    icon: Phone,
    title: "1. Đăng ký",
    text: "Gọi hotline hoặc điền form đăng ký lái thử với dòng xe bạn quan tâm.",
  },
  {
    icon: CalendarClock,
    title: "2. Xác nhận lịch",
    text: "Tư vấn viên liên hệ trong vòng 24h để chốt thời gian và địa điểm lái thử.",
  },
  {
    icon: Home,
    title: "3. Nhận xe tận nơi",
    text: "Nhân viên đưa xe đến showroom hoặc tận nhà theo lịch hẹn của bạn.",
  },
  {
    icon: Car,
    title: "4. Trải nghiệm",
    text: "Lái thử miễn phí, được hướng dẫn đầy đủ tính năng và giải đáp mọi thắc mắc.",
  },
];

export default async function TestDrivePage() {
  const cars = await getCars();

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Đăng ký lái thử", href: "/dang-ky-lai-thu" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Trải nghiệm"
          title={testDriveContent.title}
          align="left"
        />
        <h1 className="sr-only">Đăng ký lái thử xe VinFast tại Đà Nẵng</h1>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={testDriveContent.image}
                alt={`Lái thử xe VinFast tại ${site.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 640px"
                className="object-cover"
              />
            </div>
            <div className="prose-vi mt-6 space-y-4">
              {testDriveContent.paragraphs.map((text, index) => (
                <p key={index} className="leading-8 text-ink-soft">
                  {text}
                </p>
              ))}
            </div>

            <a
              href={PHONE_HREF}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-orange px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <Phone className="size-4" aria-hidden />
              Gọi nhanh {site.hotline}
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-[7.5rem] lg:h-fit">
            <h2 className="text-lg font-extrabold text-ink">Form đăng ký lái thử</h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Chọn dòng xe bạn muốn trải nghiệm, chúng tôi sẽ sắp lịch trong 24h.
            </p>
            <div className="mt-4">
              <LeadForm
                source="test-drive"
                withCarField
                withMessage
                submitLabel="Đăng ký lái thử"
              />
            </div>
            <p className="mt-4 text-[12px] leading-5 text-ink-soft">
              Các dòng xe hỗ trợ lái thử:{" "}
              {cars.map((car) => car.name).join(", ")}.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site">
          <SectionHeading eyebrow="Quy trình" title="4 bước lái thử xe VinFast" />
          <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[14px] leading-7 text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Đăng ký lái thử", href: "/dang-ky-lai-thu" },
          ]),
        )}
      />
    </>
  );
}
