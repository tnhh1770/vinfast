import "server-only";
import { cache } from "react";

import carsSeed from "@/data/cars.json";
import contentSeed from "@/data/content.json";
import { connectToDatabase, hasDatabase } from "@/lib/mongodb";
import CarModel from "@/lib/models/Car";
import PostModel from "@/lib/models/Post";
import PageModel from "@/lib/models/Page";
import type { Car, Post, StaticPage } from "@/types";

/** Thứ tự hiển thị giống hệt menu/bảng giá của bản gốc. */
export const CAR_ORDER = [
  "new-vinfast-vf8",
  "vinfast-vf-mpv-7",
  "limo-green",
  "vinfast-vf-3",
  "vinfast-vf5",
  "vinfast-vf6",
  "vinfast-vf7",
  "vinfast-vf9",
  "vinfast-ec-van",
  "minio-green",
  "herio-green",
  "nerio-green",
];

function sortCars(list: Car[]): Car[] {
  return [...list].sort((a, b) => {
    const ia = CAR_ORDER.indexOf(a.slug);
    const ib = CAR_ORDER.indexOf(b.slug);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

const seedCars = sortCars(carsSeed as unknown as Car[]);
const seedPosts = (contentSeed.posts as unknown as Post[]).slice();
const seedPages = (contentSeed.pages as unknown as StaticPage[]).slice();

async function db() {
  if (!hasDatabase) return null;
  return connectToDatabase();
}

function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export const getCars = cache(async (): Promise<Car[]> => {
  const conn = await db();
  if (conn) {
    const docs = await CarModel.find({}).lean();
    if (docs.length) return sortCars(plain<Car[]>(docs));
  }
  return seedCars;
});

export const getCarsByGroup = cache(
  async (group: "xe-vinfast" | "xe-dich-vu"): Promise<Car[]> => {
    const all = await getCars();
    return all.filter((car) => car.group === group);
  },
);

export const getCar = cache(async (slug: string): Promise<Car | null> => {
  const conn = await db();
  if (conn) {
    const doc = await CarModel.findOne({ slug }).lean();
    if (doc) return plain<Car>(doc);
  }
  return seedCars.find((car) => car.slug === slug) ?? null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const conn = await db();
  if (conn) {
    const docs = await PostModel.find({}).sort({ publishedAt: -1 }).lean();
    if (docs.length) return plain<Post[]>(docs);
  }
  return [...seedPosts].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const conn = await db();
  if (conn) {
    const doc = await PostModel.findOne({ slug }).lean();
    if (doc) return plain<Post>(doc);
  }
  return seedPosts.find((post) => post.slug === slug) ?? null;
});

export const getStaticPages = cache(async (): Promise<StaticPage[]> => {
  const conn = await db();
  if (conn) {
    const docs = await PageModel.find({}).lean();
    if (docs.length) return plain<StaticPage[]>(docs);
  }
  return seedPages;
});

export const getStaticPage = cache(
  async (slug: string): Promise<StaticPage | null> => {
    const conn = await db();
    if (conn) {
      const doc = await PageModel.findOne({ slug }).lean();
      if (doc) return plain<StaticPage>(doc);
    }
    return seedPages.find((page) => page.slug === slug) ?? null;
  },
);

export const getRelatedCars = cache(
  async (slug: string, limit = 4): Promise<Car[]> => {
    const all = await getCars();
    const current = all.find((car) => car.slug === slug);
    if (!current) return all.slice(0, limit);
    const sameGroup = all.filter(
      (car) => car.slug !== slug && car.group === current.group,
    );
    const rest = all.filter(
      (car) => car.slug !== slug && car.group !== current.group,
    );
    return [...sameGroup, ...rest].slice(0, limit);
  },
);
