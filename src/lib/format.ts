const vnd = new Intl.NumberFormat("vi-VN");

export function formatNumber(value: number): string {
  return vnd.format(Math.round(value || 0));
}

export function formatVnd(value: number, suffix = "₫"): string {
  return `${formatNumber(value)} ${suffix}`;
}

/** 999.000.000 -> "999 triệu"; 1.499.000.000 -> "1,499 tỷ" */
export function formatShortVnd(value: number): string {
  if (!value) return "Liên hệ";
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(3).replace(/\.?0+$/, "").replace(".", ",")} tỷ`;
  }
  return `${Math.round(value / 1_000_000)} triệu`;
}

export function formatDateVi(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function slugifyVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Bản ghi do CRM tạo có thể thiếu các trường mô tả -> nhận cả `undefined`. */
export function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(input?: string | null, max = 160): string {
  const clean = stripHtml(input);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, "")}…`;
}
