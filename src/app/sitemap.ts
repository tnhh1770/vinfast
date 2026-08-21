import type { MetadataRoute } from "next";

import { getCars, getPosts, getStaticPages } from "@/lib/repo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cars, posts, pages] = await Promise.all([
    getCars(),
    getPosts(),
    getStaticPages(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${SITE_URL}/xe/`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/bang-gia-xe/`, changeFrequency: "daily", priority: 0.95, lastModified: now },
    { url: `${SITE_URL}/tinh-phi-lan-banh/`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/thu-tuc-tra-gop/`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/tra-gop-xe-vinfast/`, changeFrequency: "monthly", priority: 0.75, lastModified: now },
    { url: `${SITE_URL}/dang-ky-lai-thu/`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/gioi-thieu/`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${SITE_URL}/lien-he/`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/tin-tuc/`, changeFrequency: "daily", priority: 0.8, lastModified: now },
  ];

  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${SITE_URL}/xe/${car.slug}/`,
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified: now,
    images: car.heroImage ? [`${SITE_URL}${car.heroImage}`] : undefined,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/${post.slug}/`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    images: post.coverImage ? [`${SITE_URL}${post.coverImage}`] : undefined,
  }));

  const categorySlugs = [...new Set(posts.map((post) => post.categorySlug))];
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/category/${slug}/`,
    changeFrequency: "weekly",
    priority: 0.5,
    lastModified: now,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${SITE_URL}/${page.slug}/`,
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: new Date(page.updatedAt || now),
  }));

  return [
    ...staticRoutes,
    ...carRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...pageRoutes,
  ];
}
