import siteData from "@/data/site.json";
import type { FeeConfig } from "@/types";

export const site = siteData.site;
export const homeContent = siteData.home;
export const aboutContent = siteData.about;
export const installmentContent = siteData.installment;
export const testDriveContent = siteData.testdrive;
export const loanContent = siteData.loanPage;
export const feeConfig = siteData.fees as FeeConfig;

export const SITE_URL = (
  process.env.PUBLIC_SITE_URL || site.url
).replace(/\/$/, "");

export const PHONE_HREF = `tel:${site.hotlineRaw}`;

export interface NavChild {
  label: string;
  href: string;
  image?: string;
  price?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  columns?: { title: string; items: NavChild[] }[];
}

export const legalLinks = [
  { label: "Thông tin đại lý / Miễn trừ trách nhiệm", href: "/thong-tin-dai-ly-mien-tru-trach-nhiem" },
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
  { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" },
  { label: "Chính sách thanh toán và đặt cọc", href: "/chinh-sach-thanh-toan-va-dat-coc" },
  { label: "Chính sách bảo hành và bảo dưỡng", href: "/chinh-sach-bao-hanh-va-bao-duong" },
  { label: "Chính sách cookie", href: "/chinh-sach-cookie" },
];

export const buyLinks = [
  { label: "Tính Phí Lăn Bánh", href: "/tinh-phi-lan-banh", description: "Dự toán chi phí lăn bánh & lãi vay" },
  { label: "Thủ Tục Trả Góp", href: "/thu-tuc-tra-gop", description: "Điều kiện, hồ sơ, lãi suất ngân hàng" },
  { label: "Đăng Ký Lái Thử", href: "/dang-ky-lai-thu", description: "Lái thử miễn phí tại nhà" },
];
