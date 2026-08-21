export interface NavCarItem {
  slug: string;
  name: string;
  image: string;
  price: string;
  nedc: string;
  category: string;
}

export interface NavCarGroup {
  label: string;
  items: NavCarItem[];
}

export interface BuyLink {
  label: string;
  href: string;
  description?: string;
}
