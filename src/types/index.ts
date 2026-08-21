export type CarGroup = "xe-vinfast" | "xe-dich-vu";

export interface CarVersion {
  name: string;
  price: number;
}

export interface CarOption {
  name: string;
  price: number;
  badge: string;
}

export interface CarPromotion {
  name: string;
  percent: number;
  fixed: number;
  badge: string;
}

export interface CarColor {
  hex: string;
  image: string;
  name?: string;
}

export type ContentBlock =
  | { type: "heading"; level?: number; text: string }
  | { type: "paragraph"; text?: string; html?: string }
  | { type: "image"; src: string; alt?: string; width?: number; height?: number }
  | { type: "caption"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "quote"; text: string };

export interface CarSection {
  title: string;
  blocks: ContentBlock[];
}

export interface Car {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  sourceUrl?: string;
  ogImage?: string;
  heroImage: string;
  thumbnail: string;
  colors: CarColor[];
  versions: CarVersion[];
  options: CarOption[];
  promotions: CarPromotion[];
  installmentFrom: number;
  installmentText: string;
  price: number;
  category: string;
  nedc: string;
  group: CarGroup | "";
  offers: string[];
  sections: Partial<Record<CarSectionKey, CarSection>>;
  order?: number;
}

export type CarSectionKey =
  | "overview"
  | "exterior"
  | "interior"
  | "performance"
  | "safety"
  | "specs"
  | "gallery";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  categorySlug: string;
  blocks: ContentBlock[];
}

export interface StaticPage {
  slug: string;
  title: string;
  updatedAt: string;
  blocks: ContentBlock[];
}

export interface Lead {
  name: string;
  phone: string;
  carInterest?: string;
  message?: string;
  source: string;
  path?: string;
  createdAt?: string | Date;
}

export interface FeeConfig {
  locations: { name: string; registrationFee: number }[];
  insuranceRate: number;
  registrationTaxRate: number;
  fixed: { label: string; value: number }[];
  loan: { defaultYears: number; defaultRate: number; maxRatio: number };
  note: string;
}
