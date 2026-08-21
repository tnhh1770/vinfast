import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";

import { PHONE_HREF, site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-[64px] font-extrabold leading-none text-brand sm:text-[96px]">
        404
      </p>
      <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
        Không tìm thấy trang bạn cần
      </h1>
      <p className="mt-3 max-w-md leading-7 text-ink-soft">
        Trang có thể đã được đổi địa chỉ hoặc không còn tồn tại. Bạn có thể quay về
        trang chủ hoặc xem bảng giá xe mới nhất.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Về trang chủ
        </Link>
        <Link
          href="/bang-gia-xe"
          className="inline-flex items-center rounded-xl border border-border px-6 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          Xem bảng giá xe
        </Link>
        <a
          href={PHONE_HREF}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          <Phone className="size-4" aria-hidden />
          {site.hotline}
        </a>
      </div>
    </div>
  );
}
