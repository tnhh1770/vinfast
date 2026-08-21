import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingCta } from "@/components/layout/floating-cta";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE_URL, site } from "@/lib/site";
import { graph, organizationSchema, websiteSchema } from "@/lib/seo";

import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VinFast Đà Nẵng | Đại Lý Chính Hãng Của VinFast Việt Nam",
    template: "%s | VinFast Đà Nẵng",
  },
  description:
    "Đại lý VinFast Đà Nẵng - báo giá xe điện VinFast mới nhất, tính phí lăn bánh, hỗ trợ trả góp đến 85% và đăng ký lái thử miễn phí tại nhà.",
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.name,
  category: "automotive",
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: site.name,
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0051E3",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
      </head>
      <body className="flex min-h-full flex-col bg-background text-ink">
        <a
          href="#noi-dung-chinh"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Bỏ qua và tới nội dung chính
        </a>

        <SiteHeader />

        <main id="noi-dung-chinh" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        <SiteFooter />
        <FloatingCta />
        <Toaster position="top-center" richColors closeButton />
        <JsonLd data={graph(organizationSchema(), websiteSchema())} />
      </body>
    </html>
  );
}
