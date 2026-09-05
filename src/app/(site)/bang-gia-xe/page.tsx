import type { Metadata } from "next";
import { Phone } from "lucide-react";

import { PriceTableGrid } from "@/components/car/price-table-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getCars } from "@/lib/repo";
import { formatNumber } from "@/lib/format";
import { PHONE_HREF, site } from "@/lib/site";
import { breadcrumbSchema, buildMetadata, faqSchema, graph, itemListSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Bảng Giá Xe VinFast Mới Nhất Tại Đà Nẵng",
  description:
    "Bảng giá xe VinFast cập nhật mới nhất tại Đà Nẵng: giá niêm yết từng phiên bản, chương trình ưu đãi có thể tích chọn để xem giá sau giảm, mức trả góp chỉ từ 55 triệu đồng.",
  path: "/bang-gia-xe",
  keywords: ["bảng giá xe vinfast", "giá xe vinfast 2026", "giá xe vinfast đà nẵng"],
});

export default async function PriceListPage() {
  const cars = await getCars();
  const min = Math.min(...cars.map((car) => car.price));
  const max = Math.max(...cars.map((car) => car.price));

  const faqs = [
    {
      question: "Bảng giá xe VinFast tại Đà Nẵng cập nhật khi nào?",
      answer:
        "Bảng giá được cập nhật ngay khi VinFast công bố thay đổi giá niêm yết hoặc chương trình ưu đãi mới. Giá hiển thị là giá niêm yết chưa bao gồm phí lăn bánh.",
    },
    {
      question: "Giá lăn bánh khác giá niêm yết bao nhiêu?",
      answer:
        "Xe điện VinFast được miễn 100% lệ phí trước bạ. Chi phí lăn bánh phát sinh gồm phí đăng ký biển số, bảo hiểm vật chất 1.6%, phí đường bộ, đăng kiểm, dịch vụ đăng ký và bảo hiểm bắt buộc. Bạn có thể dùng công cụ Tính phí lăn bánh để dự toán chính xác.",
    },
    {
      question: "Xe VinFast rẻ nhất và đắt nhất hiện nay giá bao nhiêu?",
      answer: `Mẫu xe có giá thấp nhất là ${formatNumber(min)}₫ và cao nhất là ${formatNumber(max)}₫ theo bảng giá hiện hành tại VinFast Đà Nẵng.`,
    },
  ];

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Bảng giá xe", href: "/bang-gia-xe" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Cập nhật mới nhất"
          title="Bảng giá xe VinFast tại Đà Nẵng"
          description="Tích chọn chương trình ưu đãi bên dưới mỗi mẫu xe để xem ngay mức giá sau giảm. Giá niêm yết chưa bao gồm chi phí lăn bánh."
        />
        <h1 className="sr-only">Bảng giá xe VinFast mới nhất tại Đà Nẵng</h1>

        <div className="mt-9">
          <PriceTableGrid cars={cars} />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 text-center">
          <p className="text-[14.5px] leading-7 text-ink-soft">
            Giá niêm yết trên đây mang tính tham khảo và có thể thay đổi theo chương
            trình của hãng tại từng thời điểm. Để nhận giá lăn bánh chính xác kèm ưu
            đãi tốt nhất, vui lòng liên hệ hotline.
          </p>
          <a
            href={PHONE_HREF}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-orange px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
          >
            <Phone className="size-4" aria-hidden />
            Gọi {site.hotline} nhận giá tốt nhất
          </a>
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Câu hỏi thường gặp về giá xe VinFast
            </h2>
            <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {faqs.map((faq) => (
                <div key={faq.question} className="p-5">
                  <dt className="text-[15.5px] font-bold text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-[14.5px] leading-7 text-ink-soft">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-ink">Nhận bảng giá qua Zalo</h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Để lại thông tin, chúng tôi gửi bảng giá lăn bánh chi tiết cho bạn.
            </p>
            <div className="mt-4">
              <LeadForm source="price-list" withCarField />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          itemListSchema(
            cars.map((car) => ({
              name: car.name,
              href: `/xe/${car.slug}`,
              image: car.heroImage,
            })),
            "Bảng giá xe VinFast tại Đà Nẵng",
          ),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Bảng giá xe", href: "/bang-gia-xe" },
          ]),
        )}
      />
    </>
  );
}
