import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { RollingFeeCalculator } from "@/components/car/rolling-fee-calculator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getCars } from "@/lib/repo";
import { feeConfig, loanContent, PHONE_HREF, site } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, faqSchema, graph } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: loanContent.seo.title,
  description: loanContent.seo.description,
  path: "/tra-gop-xe-vinfast",
  keywords: [
    "trả góp xe vinfast",
    "vay mua xe vinfast",
    "lãi suất vay mua xe vinfast",
    "hồ sơ vay mua xe vinfast",
  ],
});

export default async function LoanPage() {
  const cars = await getCars();

  const faqs = [
    {
      question: "Vay mua xe VinFast được tối đa bao nhiêu phần trăm?",
      answer:
        "Khách hàng được vay tới 85% giá trị xe mới (tối đa 70% với xe đã qua sử dụng, tùy ngân hàng), tài sản đảm bảo chính là chiếc xe mua nên không cần thế chấp thêm.",
    },
    {
      question: "Lãi suất vay mua xe VinFast hiện nay là bao nhiêu?",
      answer: loanContent.banks.items
        .map((bank) => `${bank.name}: ${bank.text}`)
        .join(" "),
    },
    {
      question: "Hồ sơ vay mua xe trả góp gồm những gì?",
      answer: loanContent.documents.groups
        .map((group) => `${group.title}: ${group.items.join(", ")}`)
        .join(". "),
    },
    {
      question: "Thời gian duyệt hồ sơ vay mất bao lâu?",
      answer:
        "Ngân hàng thẩm định trong 1–3 ngày làm việc, trường hợp nhanh có thể nhận kết quả trong 24 giờ. Toàn bộ quy trình 6 bước hoàn tất trong 2–5 ngày làm việc.",
    },
  ];

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: loanContent.title, href: "/tra-gop-xe-vinfast" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Tài chính"
          title={loanContent.title}
          description="Tính trước số tiền phải trả mỗi tháng, nắm rõ điều kiện, hồ sơ và quy trình vay trước khi ký hợp đồng."
        />
        <h1 className="sr-only">Trả góp xe VinFast tại Đà Nẵng</h1>

        <div className="mt-9">
          <RollingFeeCalculator cars={cars} fees={feeConfig} />
        </div>
      </section>

      {/* Điều kiện + Hồ sơ */}
      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">
                  {loanContent.requirements.title}
                </h2>
                <p className="text-[13px] text-ink-soft">
                  {loanContent.requirements.subtitle}
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {loanContent.requirements.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14.5px] leading-7 text-ink-soft">
                  <CheckCircle2 className="mt-1.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex gap-2.5 rounded-xl bg-amber-500/10 p-4 text-[13.5px] leading-6 text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {loanContent.requirements.note}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <FileText className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">
                  {loanContent.documents.title}
                </h2>
                <p className="text-[13px] text-ink-soft">
                  {loanContent.documents.subtitle}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {loanContent.documents.groups.map((group) => (
                <div key={group.title} className="rounded-xl border border-border bg-muted/40 p-4">
                  <h3 className="flex flex-wrap items-center gap-2 text-[14.5px] font-bold text-ink">
                    {group.title}
                    <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-bold uppercase text-brand">
                      {group.badge}
                    </span>
                  </h3>
                  <ul className="mt-2.5 space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[13.5px] leading-6 text-ink-soft">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình */}
      <section className="container-site py-14">
        <SectionHeading
          eyebrow="Quy trình"
          title={loanContent.process.title}
          description={loanContent.process.subtitle}
        />
        <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loanContent.process.steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-brand/12">
                {index + 1}
              </span>
              <h3 className="pr-10 text-[15.5px] font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-7 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ngân hàng */}
      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Building2 className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">{loanContent.banks.title}</h2>
                <p className="text-[13px] text-ink-soft">{loanContent.banks.subtitle}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {loanContent.banks.items.map((bank) => (
                <li
                  key={bank.name}
                  className="flex gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[14px] leading-6 text-ink-soft"
                >
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>
                    <strong className="font-bold text-ink">{bank.name}:</strong> {bank.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
              <h2 className="text-lg font-bold text-ink">
                {loanContent.banks.warnings.title}
              </h2>
            </div>
            <ul className="mt-5 space-y-2.5">
              {loanContent.banks.warnings.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14.5px] leading-7 text-ink-soft">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-brand-soft p-4 text-[13.5px] leading-6 text-ink-soft">
              <strong className="font-bold text-brand">Hỗ trợ miễn phí:</strong>{" "}
              {loanContent.banks.support}
            </p>
          </div>
        </div>
      </section>

      {/* CTA + FAQ */}
      <section className="container-site py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Câu hỏi thường gặp về trả góp xe VinFast
            </h2>
            <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {faqs.map((faq) => (
                <div key={faq.question} className="p-5">
                  <dt className="text-[15.5px] font-bold text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-[14.5px] leading-7 text-ink-soft">{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[14px] text-ink-soft">
              Xem thêm{" "}
              <Link href="/thu-tuc-tra-gop" className="font-semibold text-brand hover:underline">
                thủ tục trả góp chi tiết
              </Link>{" "}
              hoặc{" "}
              <Link href="/tinh-phi-lan-banh" className="font-semibold text-brand hover:underline">
                tính phí lăn bánh
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-[7.5rem] lg:h-fit">
            <h2 className="text-xl font-extrabold text-ink">{loanContent.cta.title}</h2>
            <p className="mt-2 text-[14px] leading-6 text-ink-soft">{loanContent.cta.text}</p>
            <div className="mt-5">
              <LeadForm source="loan" withCarField submitLabel="Nhận tư vấn tài chính" />
            </div>
            <a
              href={PHONE_HREF}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-orange px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <Phone className="size-4" aria-hidden />
              Liên hệ tư vấn ngay {site.hotline}
            </a>
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: loanContent.title, href: "/tra-gop-xe-vinfast" },
          ]),
        )}
      />
    </>
  );
}
