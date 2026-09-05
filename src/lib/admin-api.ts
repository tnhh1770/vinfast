"use client";

import { toast } from "sonner";

export type AdminMessage = { type: "success" | "error"; text: string } | null;

/**
 * Thông báo kết quả thao tác CRM.
 *
 * Trước đây mỗi màn hình tự vẽ một dải thông báo ở đầu trang. Dải đó nằm dưới
 * lớp phủ modal (`fixed z-50`) và trôi khỏi tầm nhìn khi người dùng đang cuộn
 * giữa bảng dài, nên thao tác thành công hay thất bại đều "không thấy gì".
 * Toast của sonner (đã mount ở `src/app/layout.tsx`) luôn nổi trên cùng.
 */
export function notify(message: AdminMessage) {
  if (!message) {
    toast.dismiss();
    return;
  }
  if (message.type === "success") toast.success(message.text);
  else toast.error(message.text);
}

/**
 * `fetch` cho các endpoint `/api/admin/*`.
 *
 * Khi phiên đăng nhập hết hạn hoặc chữ ký cookie không còn hợp lệ, proxy trả về
 * 401 kèm JSON. Nếu không xử lý tập trung, mọi nút bấm sẽ im lặng thất bại và
 * người dùng tưởng giao diện bị hỏng — nên bắt 401 ở đây và đưa thẳng về trang
 * đăng nhập, giữ lại đường dẫn hiện tại để quay lại sau khi đăng nhập.
 */
export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    toast.error("Phiên đăng nhập đã hết hạn, đang chuyển tới trang đăng nhập…");
    const back = encodeURIComponent(window.location.pathname);
    // Cố ý dùng điều hướng cứng thay vì router.push: phiên đã hỏng nên cần bỏ
    // toàn bộ cache router phía client và để proxy dựng lại từ đầu.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login/?redirect=${back}`;
  }

  return res;
}

export interface AdminJson<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/** Đọc JSON an toàn: endpoint lỗi có thể trả về HTML hoặc body rỗng. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mỗi màn hình có kiểu `data` riêng
export async function readJson<T = any>(res: Response): Promise<AdminJson<T>> {
  try {
    return (await res.json()) as AdminJson<T>;
  } catch {
    return { success: false, message: `Máy chủ trả về lỗi ${res.status}.` };
  }
}
