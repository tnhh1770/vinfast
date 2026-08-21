import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { FacebookIcon } from "@/components/shared/brand-icons";

import { getCars } from "@/lib/repo";
import { PHONE_HREF, buyLinks, legalLinks, site } from "@/lib/site";
import { LeadForm } from "@/components/forms/lead-form";

export async function SiteFooter() {
  const cars = await getCars();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-brand-dark text-white/85">
      <div className="container-site grid gap-10 py-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Link href="/" aria-label={`${site.name} - trang chủ`}>
            <Image
              src={site.logo}
              alt={`Logo ${site.name}`}
              width={569}
              height={111}
              sizes="200px"
              className="h-11 w-auto"
            />
          </Link>
          <p className="mt-5 text-sm leading-7">
            Đại lý ủy quyền chính hãng VinFast tại Đà Nẵng. Tư vấn mua xe, trả góp,
            lái thử và dịch vụ hậu mãi tiêu chuẩn VinFast 3S cho khách hàng khu vực
            Miền Trung.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-orange" aria-hidden />
              <span>Địa Chỉ: {site.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent-orange" aria-hidden />
              <a href={PHONE_HREF} className="font-semibold hover:underline">
                Hotline: {site.hotline}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent-orange" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:underline">
                Email: {site.email}
              </a>
            </li>
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook VinFast Đà Nẵng"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <FacebookIcon className="size-4" aria-hidden />
            </a>
            <a
              href={site.zalo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat Zalo với VinFast Đà Nẵng"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <MessageCircle className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        <nav aria-label="Danh mục xe" className="lg:col-span-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Các dòng xe
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm lg:grid-cols-1">
            {cars.map((car) => (
              <li key={car.slug}>
                <Link href={`/xe/${car.slug}`} className="hover:text-white hover:underline">
                  {car.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Hỗ trợ mua xe" className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Mua xe
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {buyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bang-gia-xe" className="hover:text-white hover:underline">
                Bảng giá xe
              </Link>
            </li>
            <li>
              <Link href="/tin-tuc" className="hover:text-white hover:underline">
                Tin tức
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-white">
            Chính sách
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Tư vấn nhanh &amp; Báo giá
          </h2>
          <p className="mt-3 text-sm">
            Để lại thông tin, tư vấn viên sẽ gọi lại trong 5 phút.
          </p>
          <div className="mt-5 rounded-2xl bg-white/8 p-4 ring-1 ring-white/12">
            <LeadForm source="footer" tone="dark" withCarField />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/65 sm:flex-row">
          <p>
            © {year} {site.name}. Bảo lưu mọi quyền.
          </p>
          <p>
            Website tham khảo – không phải trang chính thức của VinFast Việt Nam.
          </p>
        </div>
      </div>
    </footer>
  );
}
