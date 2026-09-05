import type { Metadata } from "next";

import { RollingFeeCalculator } from "@/components/car/rolling-fee-calculator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getCars } from "@/lib/repo";
import { feeConfig } from "@/lib/site";
import { formatNumber } from "@/lib/format";
import { breadcrumbSchema, buildMetadata, faqSchema, graph } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Tính Phí Lăn Bánh Xe VinFast Tại Đà Nẵng",
  description:
    "Công cụ tính phí lăn bánh xe VinFast tại Đà Nẵng: chọn mẫu xe, phiên bản, tùy chọn thêm và chương trình ưu đãi để có ngay giá lăn bánh cùng bảng lãi trả góp chi tiết.",
  path: "/tinh-phi-lan-banh",
  keywords: [
    "tính phí lăn bánh vinfast",
    "giá lăn bánh xe vinfast",
    "tính lãi trả góp xe vinfast",
  ],
});

export default async function RollingFeePage() {
  const cars = await getCars();

  const faqs = [
    {
      question: "Xe điện VinFast có phải đóng lệ phí trước bạ không?",
      answer:
        "Không. Ô tô điện chạy pin đang được miễn 100% lệ phí trước bạ theo Nghị định 10/2022/NĐ-CP, vì vậy mục Phí trước bạ trong bảng dự toán bằng 0 đồng.",
    },
    {
      question: "Giá lăn bánh gồm những khoản nào?",
      answer: `Giá lăn bánh gồm giá xe niêm yết, lệ phí trước bạ (0đ với xe điện), phí đăng ký biển số, bảo hiểm vật chất ${feeConfig.insuranceRate}% giá xe, phí đường bộ ${formatNumber(
        feeConfig.fixed[0].value,
      )}đ, đăng kiểm ${formatNumber(feeConfig.fixed[1].value)}đ, dịch vụ đăng ký ${formatNumber(
        feeConfig.fixed[2].value,
      )}đ và bảo hiểm bắt buộc ${formatNumber(feeConfig.fixed[3].value)}đ.`,
    },
    {
      question: "Trả lãi theo dư nợ giảm dần và chia đều khác nhau thế nào?",
      answer:
        "Dư nợ giảm dần tính lãi trên số tiền còn nợ thực tế, số tiền trả hàng tháng giảm dần và tổng lãi thấp hơn. Lãi chia đều tính lãi cố định trên toàn bộ khoản vay ban đầu, số tiền trả mỗi tháng bằng nhau nhưng tổng lãi cao hơn.",
    },
  ];

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Tính phí lăn bánh", href: "/tinh-phi-lan-banh" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Công cụ"
          title="Tính phí lăn bánh &amp; lãi trả góp"
          description="Chọn mẫu xe, phiên bản và các chương trình ưu đãi đang áp dụng để xem ngay giá lăn bánh dự kiến tại Đà Nẵng."
        />
        <h1 className="sr-only">Tính phí lăn bánh xe VinFast tại Đà Nẵng</h1>

        <div className="mt-9">
          <RollingFeeCalculator cars={cars} fees={feeConfig} />
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Giải đáp về chi phí lăn bánh
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
            <h2 className="text-lg font-extrabold text-ink">
              Nhận báo giá lăn bánh chính xác
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Giá lăn bánh có thể khác nhau tùy tỉnh thành. Để lại thông tin để được
              tư vấn chính xác nhất.
            </p>
            <div className="mt-4">
              <LeadForm source="rolling-fee" withCarField />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={graph(
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Tính phí lăn bánh", href: "/tinh-phi-lan-banh" },
          ]),
        )}
      />
    </>
  );
}
