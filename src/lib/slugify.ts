/** Chuẩn hoá tiêu đề tiếng Việt thành slug URL: bỏ dấu, đ -> d, gộp ký tự lạ thành "-". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
