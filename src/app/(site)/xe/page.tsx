import type { Metadata } from "next";

import { CarGridTabs } from "@/components/car/car-grid-tabs";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { getCars } from "@/lib/repo";
import { buildMetadata, breadcrumbSchema, graph, itemListSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Các Dòng Xe Điện VinFast - Giá & Thông Số Mới Nhất",
  description:
    "Danh sách đầy đủ 12 dòng xe điện VinFast đang phân phối tại Đà Nẵng: VF 3, VF 5, VF 6, VF 7, VF 8, VF 9, VF MPV 7, Limo Green, EC Van, Minio/Herio/Nerio Green. Giá niêm yết, quãng đường NEDC, mức trả góp.",
  path: "/xe",
  keywords: ["các dòng xe vinfast", "xe điện vinfast", "danh sách xe vinfast", "vinfast đà nẵng"],
});

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs items={[{ name: "Xe VinFast", href: "/xe" }]} />
      </div>

      <section className="container-site py-10 sm:py-12">
        <SectionHeading
          eyebrow="Danh mục xe"
          title="Các dòng xe điện VinFast"
          description="Toàn bộ danh mục xe VinFast đang phân phối tại Đà Nẵng, kèm giá niêm yết, phân khúc, quãng đường di chuyển và mức trả góp tối thiểu."
        />
        <h1 className="sr-only">Các dòng xe điện VinFast tại Đà Nẵng</h1>

        <div className="mt-9">
          <CarGridTabs cars={cars} priorityCount={4} />
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-site grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Chưa biết chọn xe nào phù hợp?
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-ink-soft">
              Để lại số điện thoại, đội ngũ tư vấn của VinFast Đà Nẵng sẽ gợi ý mẫu xe
              phù hợp với nhu cầu và ngân sách của bạn, kèm bảng giá lăn bánh chi tiết
              và phương án trả góp tối ưu.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <LeadForm source="cars-list" withCarField />
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
            "Các dòng xe điện VinFast",
          ),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Xe VinFast", href: "/xe" },
          ]),
        )}
      />
    </>
  );
}
