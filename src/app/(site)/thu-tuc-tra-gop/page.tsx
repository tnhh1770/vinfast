import type { Metadata } from "next";
import { BadgeCheck, ClipboardList, FileText, Users } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { installmentContent } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, faqSchema, graph } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: installmentContent.seo.title,
  description: installmentContent.seo.description,
  path: "/thu-tuc-tra-gop",
  keywords: [
    "thủ tục trả góp xe vinfast",
    "mua xe vinfast trả góp",
    "vay mua xe vinfast",
    "hồ sơ vay mua ô tô",
  ],
});

const GROUP_ICONS = [BadgeCheck, ClipboardList, Users, FileText, FileText];

export default function InstallmentPage() {
  const faqs = installmentContent.groups.slice(0, 3).map((group) => ({
    question: group.title,
    answer: group.items.join(" "),
  }));

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Thủ tục trả góp", href: "/thu-tuc-tra-gop" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Tài chính"
          title={installmentContent.title}
          align="left"
        />
        <h1 className="sr-only">Thủ tục mua xe VinFast trả góp tại Đà Nẵng</h1>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="prose-vi space-y-4">
            {installmentContent.intro.map((text, index) => (
              <p
                key={index}
                className={
                  index === 1
                    ? "font-semibold text-ink"
                    : "leading-8 text-ink-soft"
                }
              >
                {text}
              </p>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-[7.5rem] lg:h-fit">
            <h2 className="text-lg font-extrabold uppercase text-ink">
              {installmentContent.formHeading}
            </h2>
            <div className="mt-4">
              <LeadForm source="installment" withCarField submitLabel="Đăng ký tư vấn" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site">
          <SectionHeading
            eyebrow="Chi tiết"
            title="Điều kiện, quyền lợi và hồ sơ vay"
          />
          <ul className="mt-9 grid gap-5 md:grid-cols-2">
            {installmentContent.groups.map((group, index) => {
              const Icon = GROUP_ICONS[index] ?? FileText;
              return (
                <li
                  key={group.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="text-lg font-bold text-ink">{group.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-[14.5px] leading-7 text-ink-soft">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <JsonLd
        data={graph(
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Thủ tục trả góp", href: "/thu-tuc-tra-gop" },
          ]),
        )}
      />
    </>
  );
}
