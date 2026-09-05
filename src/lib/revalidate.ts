import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Các trang public đọc dữ liệu xe đều là ISR (`revalidate = 3600`), nên nếu không
 * xoá cache thủ công thì thay đổi trong CRM phải chờ tới 1 tiếng mới hiển thị.
 *
 * Lưu ý: `/xe/[slug]` và `/category/[slug]` được prerender bằng
 * `generateStaticParams`, với loại trang này phải truyền đúng chuỗi pattern kèm
 * type "page" thì Next mới xoá cache — truyền đường dẫn cụ thể sẽ không ăn.
 */
export function revalidateCarPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/xe");
  revalidatePath("/bang-gia-xe");
  revalidatePath("/tinh-phi-lan-banh");
  revalidatePath("/dang-ky-lai-thu");
  revalidatePath("/sitemap.xml");

  revalidatePath("/xe/[slug]", "page");
  if (slug) revalidatePath(`/xe/${slug}`);

  // Trang quản trị đọc cùng nguồn dữ liệu.
  revalidatePath("/admin", "layout");
}

export function revalidatePostPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  revalidatePath("/sitemap.xml");

  revalidatePath("/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  if (slug) revalidatePath(`/${slug}`);

  revalidatePath("/admin/posts");
}
