import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Phone } from "lucide-react";

import { CarHero } from "@/components/car/car-hero";
import { CarSectionNav } from "@/components/car/car-section-nav";
import { CarGallery } from "@/components/car/car-gallery";
import { ContentBlocks } from "@/components/car/content-blocks";
import { RollingFeeCalculator } from "@/components/car/rolling-fee-calculator";
import { CarCard } from "@/components/car/car-card";
import { LeadForm } from "@/components/forms/lead-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { getCar, getCars, getRelatedCars } from "@/lib/repo";
import { feeConfig, PHONE_HREF, site } from "@/lib/site";
import { formatNumber } from "@/lib/format";
import {
  breadcrumbSchema,
  buildMetadata,
  carProductSchema,
  faqSchema,
  graph,
} from "@/lib/seo";
import type { CarSectionKey, ContentBlock } from "@/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cars = await getCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/xe/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: "Không tìm thấy xe" };

  return buildMetadata({
    title: car.metaTitle || `${car.name} - Giá lăn bánh & Trả góp tại Đà Nẵng`,
    description:
      car.metaDescription ||
      `${car.name} giá từ ${formatNumber(car.price)}₫ tại VinFast Đà Nẵng. Tính phí lăn bánh, trả góp từ ${car.installmentText}, lái thử miễn phí.`,
    path: `/xe/${car.slug}`,
    image: car.heroImage,
    keywords: [
      car.name.toLowerCase(),
      `giá ${car.name.toLowerCase()}`,
      `${car.name.toLowerCase()} đà nẵng`,
      `${car.name.toLowerCase()} trả góp`,
      "vinfast đà nẵng",
    ],
  });
}

const SECTION_ANCHORS: { key: CarSectionKey; id: string }[] = [
  { key: "exterior", id: "ngoaithat" },
  { key: "interior", id: "noithat" },
  { key: "performance", id: "vanhanh" },
  { key: "safety", id: "antoan" },
  { key: "specs", id: "tskt" },
];

export default async function CarDetailPage({ params }: PageProps<"/xe/[slug]">) {
  const { slug } = await params;
  const [car, allCars, related] = await Promise.all([
    getCar(slug),
    getCars(),
    getRelatedCars(slug, 4),
  ]);

  if (!car) notFound();

  const overview = car.sections.overview;
  const gallerySection = car.sections.gallery;
  const galleryImages =
    (gallerySection?.blocks.filter(
      (block): block is Extract<ContentBlock, { type: "image" }> =>
        block.type === "image",
    ) ?? []).map((block) => ({ src: block.src, alt: block.alt }));

  const availableAnchors = SECTION_ANCHORS.filter(
    ({ key }) => car.sections[key]?.blocks.length,
  ).map(({ id }) => id);
  if (galleryImages.length) availableAnchors.push("anh");

  const faqs = [
    {
      question: `Giá xe ${car.name} bao nhiêu tại Đà Nẵng?`,
      answer: `${car.name} có giá niêm yết từ ${formatNumber(car.price)}₫${
        car.versions.length > 1
          ? ` cho ${car.versions.length} phiên bản: ${car.versions
              .map((v) => `${v.name} (${formatNumber(v.price)}₫)`)
              .join(", ")}`
          : ""
      }. Giá lăn bánh tại Đà Nẵng đã bao gồm phí đăng ký, bảo hiểm và các phí liên quan — vui lòng dùng công cụ tính phí lăn bánh trên trang hoặc gọi ${site.hotline}.`,
    },
    {
      question: `Mua ${car.name} trả góp cần trả trước bao nhiêu?`,
      answer: `Khách hàng có thể mua ${car.name} trả góp với số tiền trả trước từ ${car.installmentText}, vay đến 85% giá trị xe, thời gian vay tối đa 8 năm, duyệt hồ sơ trong 24h.`,
    },
    {
      question: `${car.name} đi được bao nhiêu km mỗi lần sạc?`,
      answer: car.nedc
        ? `${car.name} có quãng đường di chuyển ${car.nedc} theo chuẩn NEDC sau mỗi lần sạc đầy.`
        : `Vui lòng liên hệ ${site.hotline} để được tư vấn chi tiết về quãng đường di chuyển của ${car.name}.`,
    },
    {
      question: `Có được lái thử ${car.name} tại Đà Nẵng không?`,
      answer: `Có. VinFast Đà Nẵng hỗ trợ lái thử ${car.name} miễn phí tại showroom ${site.address} hoặc đưa xe đến tận nhà theo lịch hẹn của khách hàng.`,
    },
  ];

  return (
    <>
      <div className="container-site pt-4">
        <Breadcrumbs
          items={[
            { name: "Xe VinFast", href: "/xe" },
            { name: car.name, href: `/xe/${car.slug}` },
          ]}
        />
      </div>

      <CarHero car={car} />

      <CarSectionNav available={availableAnchors} />

      {/* Ưu đãi mua xe */}
      {car.offers.length ? (
        <section
          aria-labelledby="uu-dai-mua-xe"
          className="container-site py-10 sm:py-12"
        >
          <div className="rounded-2xl border border-accent-orange/30 bg-accent-orange/5 p-6 sm:p-8">
            <h2
              id="uu-dai-mua-xe"
              className="text-xl font-extrabold uppercase text-ink sm:text-2xl"
            >
              Ưu đãi mua {car.name}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {car.offers.map((offer, index) => (
                <li key={index} className="flex gap-3 text-[14.5px] leading-7 text-ink-soft">
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0 text-accent-orange"
                    aria-hidden
                  />
                  <span dangerouslySetInnerHTML={{ __html: offer }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Tính phí lăn bánh & trả góp */}
      <section
        id="tinh-phi"
        aria-labelledby="lan-banh-tra-gop"
        className="container-site py-10 sm:py-12"
      >
        <h2
          id="lan-banh-tra-gop"
          className="text-2xl font-extrabold text-ink sm:text-[32px]"
        >
          Lăn bánh và trả góp {car.name}
        </h2>
        <div className="mt-2 h-1 w-16 rounded-full bg-brand" aria-hidden />
        <div className="mt-7">
          <RollingFeeCalculator
            cars={allCars}
            lockedCarSlug={car.slug}
            fees={feeConfig}
            showCarPicker={false}
          />
        </div>
      </section>

      {/* Nội dung chi tiết */}
      <div className="container-site grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          {overview?.blocks.length ? (
            <section id="tongquan">
              <h2 className="text-2xl font-extrabold text-ink sm:text-[30px]">
                {overview.title || `Tổng quan ${car.name}`}
              </h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-brand" aria-hidden />
              <ContentBlocks
                blocks={overview.blocks}
                imageAltPrefix={car.name}
                className="mt-6"
              />
            </section>
          ) : null}

          {SECTION_ANCHORS.map(({ key, id }) => {
            const section = car.sections[key];
            if (!section?.blocks.length) return null;
            return (
              <section key={id} id={id} className="mt-12">
                <h2 className="text-2xl font-extrabold text-ink sm:text-[30px]">
                  {section.title}
                </h2>
                <div className="mt-2 h-1 w-16 rounded-full bg-brand" aria-hidden />
                <ContentBlocks
                  blocks={section.blocks}
                  imageAltPrefix={`${car.name} ${section.title}`}
                  className="mt-6"
                  groupImages={key !== "specs"}
                />
              </section>
            );
          })}

          {galleryImages.length ? (
            <section id="anh" className="mt-12">
              <h2 className="text-2xl font-extrabold text-ink sm:text-[30px]">
                {gallerySection?.title || `Hình ảnh ${car.name}`}
              </h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-brand" aria-hidden />
              <div className="mt-6">
                <CarGallery images={galleryImages} name={car.name} />
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold text-ink sm:text-[30px]">
              Câu hỏi thường gặp về {car.name}
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-brand" aria-hidden />
            <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-card p-5">
                  <dt className="text-[15.5px] font-bold text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-[14.5px] leading-7 text-ink-soft">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[7.5rem] lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-ink">
              Nhận giá tốt nhất cho {car.name}
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">
              Tư vấn viên báo giá lăn bánh chính xác và ưu đãi mới nhất trong 5 phút.
            </p>
            <div className="mt-4">
              <LeadForm
                source={`car-${car.slug}`}
                defaultCar={car.name}
                withCarField
                submitLabel="Nhận báo giá"
              />
            </div>
            <a
              href={PHONE_HREF}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent-orange/40 bg-accent-orange/10 px-4 py-3 text-sm font-bold text-accent-orange transition hover:bg-accent-orange hover:text-white"
            >
              <Phone className="size-4" aria-hidden />
              Gọi ngay {site.hotline}
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[16/10]">
              <Image
                src={car.thumbnail || car.heroImage}
                alt={`${car.name} tại showroom ${site.name}`}
                fill
                sizes="340px"
                className="object-cover"
              />
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-ink-soft">Phân khúc</dt>
                <dd className="font-semibold text-ink">{car.category || "—"}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-ink-soft">Quãng đường (NEDC)</dt>
                <dd className="font-semibold text-ink">{car.nedc || "—"}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-ink-soft">Giá niêm yết từ</dt>
                <dd className="font-bold text-accent-red">
                  {formatNumber(car.price)} ₫
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-ink-soft">Trả góp từ</dt>
                <dd className="font-semibold text-ink">{car.installmentText}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Xe liên quan */}
      {related.length ? (
        <section aria-labelledby="xe-lien-quan" className="bg-muted/50 py-14">
          <div className="container-site">
            <div className="flex items-end justify-between gap-4">
              <h2 id="xe-lien-quan" className="text-2xl font-extrabold text-ink sm:text-3xl">
                Các dòng xe khác
              </h2>
              <Link href="/xe" className="text-sm font-bold text-brand hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <CarCard car={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={graph(
          carProductSchema(car),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Trang chủ", href: "/" },
            { name: "Xe VinFast", href: "/xe" },
            { name: car.name, href: `/xe/${car.slug}` },
          ]),
        )}
      />
    </>
  );
}
