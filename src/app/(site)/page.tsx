import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, HeartHandshake, Phone, Trophy } from "lucide-react";

import { CarGridTabs } from "@/components/car/car-grid-tabs";
import { HeroSlider } from "@/components/home/hero-slider";
import { ShowroomGallery } from "@/components/home/showroom-gallery";
import { YoutubeEmbed } from "@/components/home/youtube-embed";
import { LeadForm } from "@/components/forms/lead-form";
import { PostCard } from "@/components/news/post-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/shared/json-ld";
import { getCars, getPosts } from "@/lib/repo";
import { PHONE_HREF, homeContent, site } from "@/lib/site";
import { buildMetadata, graph, itemListSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: homeContent.seo.title,
  description: homeContent.seo.description,
  path: "/",
  keywords: [
    "vinfast đà nẵng",
    "giá xe vinfast",
    "đại lý vinfast đà nẵng",
    "mua xe vinfast trả góp",
    "vinfast vf3 đà nẵng",
    "lái thử xe vinfast",
  ],
});

const FEATURE_ICONS = [BadgeCheck, HeartHandshake, Trophy];

export default async function HomePage() {
  const [cars, posts] = await Promise.all([getCars(), getPosts()]);
  const latestPosts = posts.slice(0, 4);

  return (
    <>
      <h1 className="sr-only">
        VinFast Đà Nẵng — Đại lý xe điện VinFast chính hãng tại Đà Nẵng
      </h1>

      <HeroSlider slides={homeContent.heroSlides} />

      {/* Thanh liên kết nhanh */}
      <div className="border-b border-border bg-brand-soft/60">
        <div className="container-site flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-[13.5px] font-semibold text-brand">
          <span className="text-ink-soft">Bạn quan tâm:</span>
          {homeContent.quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="capitalize hover:underline">
              {link.label}
            </Link>
          ))}
          <Link href="/bang-gia-xe" className="hover:underline">
            bảng giá mới nhất
          </Link>
        </div>
      </div>

      {/* Danh sách xe */}
      <section aria-label="Các dòng xe VinFast" className="container-site py-14 sm:py-16">
        <SectionHeading
          eyebrow="Sản phẩm"
          title="Các dòng xe VinFast tại Đà Nẵng"
          description="12 mẫu xe điện VinFast đang phân phối — giá niêm yết, mức trả góp và ưu đãi cập nhật liên tục."
        />
        <div className="mt-9">
          <CarGridTabs cars={cars} priorityCount={4} />
        </div>
      </section>

      {/* Banner tìm hiểu thêm */}
      <section aria-label="Nội dung nổi bật" className="container-site pb-14 sm:pb-16">
        <SectionHeading eyebrow="Nổi bật" title="Tìm hiểu thêm" as="h2" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {homeContent.featureBanners.map((banner) => (
            <li key={banner.href}>
              <Link
                href={banner.href}
                className="group relative block overflow-hidden rounded-2xl bg-ink"
              >
                <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                  <Image
                    src={banner.image}
                    alt={`VinFast ${banner.title} - ${site.name}`}
                    fill
                    sizes="(max-width: 768px) 92vw, 380px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-extrabold">{banner.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[12.5px] font-bold uppercase tracking-wide backdrop-blur transition group-hover:bg-white group-hover:text-ink">
                    {banner.cta}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Tin tức */}
      <section aria-label="Tin tức mới" className="bg-muted/50 py-14 sm:py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Tin tức"
              title="Tin tức xe điện VinFast"
              align="left"
              className="max-w-2xl"
            />
            <Link
              href="/tin-tuc"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
            >
              Xem tất cả
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA trả góp */}
      <section className="bg-brand py-12 text-white">
        <div className="container-site flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold uppercase sm:text-3xl">
              {homeContent.installmentCta.title}
            </h2>
            <p className="mt-2 text-white/80">
              Lãi suất ưu đãi từ 0.5% · Duyệt hồ sơ trong 24h · Nhận xe ngay
            </p>
          </div>
          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-lg font-extrabold text-brand shadow-lg transition hover:bg-white/90"
          >
            <Phone className="size-5" aria-hidden />
            {homeContent.installmentCta.phone}
          </a>
        </div>
      </section>

      {/* Giới thiệu đại lý */}
      <section aria-label="Về VinFast Đà Nẵng" className="container-site py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <Image
              src={homeContent.about.image}
              alt={`Showroom ${site.name} tại ${site.address}`}
              fill
              sizes="(max-width: 1024px) 92vw, 560px"
              className="object-cover"
            />
          </div>

          <div>
            <SectionHeading
              eyebrow="Về chúng tôi"
              title={homeContent.about.heading}
              align="left"
            />

            <ul className="mt-7 space-y-5">
              {homeContent.about.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? BadgeCheck;
                return (
                  <li key={feature.title} className="flex gap-4">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-base font-bold uppercase text-ink">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-[14.5px] leading-7 text-ink-soft">
                        {feature.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/gioi-thieu"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Tìm hiểu về đại lý
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <ShowroomGallery images={homeContent.showroomGallery} />
        </div>
      </section>

      {/* Video + form */}
      <section aria-label="Video giới thiệu" className="bg-muted/50 py-14 sm:py-16">
        <div className="container-site grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Video"
              title="Video giới thiệu"
              align="left"
              description="Khám phá không gian showroom và trải nghiệm các dòng xe điện VinFast."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {homeContent.videos.map((video) => (
                <YoutubeEmbed
                  key={video.youtubeId}
                  id={video.youtubeId}
                  title={`${video.title} - ${site.name}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink">
              Nhận báo giá &amp; ưu đãi mới nhất
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Điền thông tin để nhận bảng giá lăn bánh chi tiết, chương trình khuyến
              mãi và lịch lái thử trong khu vực Đà Nẵng.
            </p>
            <div className="mt-5">
              <LeadForm source="home-consult" withCarField />
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
            "Các dòng xe VinFast tại Đà Nẵng",
          ),
        )}
      />
    </>
  );
}
