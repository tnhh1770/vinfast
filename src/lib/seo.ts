import type { Metadata } from "next";
import { SITE_URL, site } from "@/lib/site";
import { truncate } from "@/lib/format";
import type { Car, Post } from "@/types";

const DEFAULT_OG = "/uploads/2026/06/vinhxdcom_anh-vinfast-da-nang-10.webp";

/** Ảnh giữ nguyên đường dẫn; trang luôn có dấu "/" ở cuối (khớp bản gốc). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  const isFile = /\.[a-z0-9]{2,5}$/i.test(clean);
  const withSlash = isFile || clean.endsWith("/") ? clean : `${clean}/`;
  return `${SITE_URL}${withSlash}`;
}

interface BuildMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
  keywords,
}: BuildMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || DEFAULT_OG);
  const desc = truncate(description, 300);

  return {
    title,
    description: desc,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      url,
      title,
      description: desc,
      siteName: site.name,
      locale: "vi_VN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JSON-LD                                                            */
/* ------------------------------------------------------------------ */

export function organizationSchema() {
  return {
    "@type": "AutoDealer",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: absoluteUrl(site.logo),
      caption: site.name,
    },
    image: absoluteUrl(site.logo),
    telephone: site.hotline,
    email: site.email,
    priceRange: "269.000.000₫ - 1.499.000.000₫",
    address: {
      "@type": "PostalAddress",
      streetAddress: "115 Nguyễn Văn Linh",
      addressLocality: "Hải Châu",
      addressRegion: site.addressLocality,
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHours: site.openingHours,
    sameAs: [site.facebook, site.zalo],
    areaServed: [
      { "@type": "City", name: "Đà Nẵng" },
      { "@type": "City", name: "Quảng Nam" },
      { "@type": "City", name: "Huế" },
    ],
    brand: { "@type": "Brand", name: "VinFast" },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site.name,
    inLanguage: "vi-VN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/xe?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function carProductSchema(car: Car) {
  const prices = car.versions.length
    ? car.versions.map((v) => v.price)
    : [car.price];
  return {
    "@type": "Car",
    "@id": `${SITE_URL}/xe/${car.slug}#product`,
    name: car.name,
    url: absoluteUrl(`/xe/${car.slug}`),
    image: absoluteUrl(car.heroImage),
    description: truncate(car.metaDescription, 300),
    brand: { "@type": "Brand", name: "VinFast" },
    manufacturer: { "@type": "Organization", name: "VinFast" },
    model: car.name.replace(/^VinFast\s*/i, ""),
    vehicleConfiguration: car.category,
    fuelType: "Electric",
    bodyType: car.category,
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineType: "Động cơ điện",
    },
    ...(car.nedc
      ? {
          emissionsCO2: 0,
          vehicleSpecialUsage: car.group === "xe-dich-vu" ? "Xe dịch vụ" : "Xe cá nhân",
        }
      : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      url: absoluteUrl(`/xe/${car.slug}`),
    },
  };
}

export function articleSchema(post: Post) {
  return {
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/${post.slug}#article`,
    headline: post.title,
    description: truncate(post.excerpt, 300),
    image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: "vi-VN",
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/${post.slug}`) },
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function itemListSchema(
  items: { name: string; href: string; image?: string }[],
  name: string,
) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.href),
      ...(item.image ? { image: absoluteUrl(item.image) } : {}),
    })),
  };
}

export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
