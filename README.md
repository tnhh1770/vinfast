# VinFast Đà Nẵng — Next.js + Mongoose + TailwindCSS + shadcn/ui

Bản dựng lại đầy đủ website **https://vinfastdanang.net** (WordPress/Elementor) trên nền
Next.js App Router, tối ưu lại UI và chuẩn SEO kỹ thuật.

Toàn bộ nội dung, hình ảnh, bảng giá, phiên bản xe, chương trình ưu đãi, công thức tính phí
lăn bánh và lãi trả góp được trích xuất 1:1 từ bản gốc.

---

## 1. Công nghệ

| Lớp | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Ngôn ngữ | TypeScript (strict) |
| Giao diện | TailwindCSS v4 + shadcn/ui (Base UI) + lucide-react |
| Dữ liệu | MongoDB qua Mongoose (có fallback JSON tĩnh) |
| Form | Server Actions + Zod + honeypot chống spam |
| Slider | embla-carousel-react |
| Thông báo | sonner |

---

## 2. Chạy dự án

```bash
npm install
cp .env.example .env.local     # sửa MONGODB_URI nếu dùng database
npm run dev                    # http://localhost:3000
```

Scripts:

```bash
npm run dev         # chạy dev
npm run build       # build production
npm run start       # chạy bản build
npm run seed        # nạp dữ liệu mẫu vào MongoDB
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

### Hai chế độ dữ liệu

* **Không có `MONGODB_URI`** → đọc từ seed JSON trong `src/data`. Web chạy ngay, không cần
  cài database. Lead gửi lên chỉ ghi log.
* **Có `MONGODB_URI`** → toàn bộ xe / bài viết / trang chính sách đọc từ MongoDB, lead được
  lưu vào collection `leads`.

Nạp dữ liệu vào MongoDB:

```bash
# .env.local
MONGODB_URI=mongodb://127.0.0.1:27017/vinfast-danang
MONGODB_DB=vinfast-danang

npm run seed
npm run build && npm run start
```

> Nếu `MONGODB_URI` được set lúc `next build`, các trang tĩnh sẽ được prerender từ MongoDB.
> Khi chạy, ISR sẽ tự làm mới nội dung theo `revalidate` của từng route.

---

## 3. Bản đồ đường dẫn (giữ nguyên URL bản gốc, có dấu `/` cuối)

| URL | Nội dung |
|---|---|
| `/` | Trang chủ: slider, 12 dòng xe có filter, banner nổi bật, tin tức, giới thiệu, video, form |
| `/gioi-thieu/` | Giới thiệu đại lý & showroom |
| `/bang-gia-xe/` | Bảng giá tương tác — tích ưu đãi để xem giá sau giảm |
| `/xe/` | Danh mục 12 dòng xe |
| `/xe/[slug]/` | Chi tiết xe: chọn màu, phiên bản, ưu đãi, tính lăn bánh, thông số, thư viện ảnh, FAQ |
| `/tinh-phi-lan-banh/` | Công cụ tính phí lăn bánh + lãi trả góp cho mọi mẫu xe |
| `/tra-gop-xe-vinfast/` | Điều kiện vay, hồ sơ, quy trình 6 bước, ngân hàng đối tác |
| `/thu-tuc-tra-gop/` | Thủ tục & hồ sơ trả góp |
| `/dang-ky-lai-thu/` | Đăng ký lái thử + quy trình 4 bước |
| `/lien-he/` | Thông tin liên hệ + bản đồ + form |
| `/tin-tuc/` | Danh sách tin tức |
| `/category/[slug]/` | Chuyên mục tin tức |
| `/[slug]/` | Bài viết & 7 trang chính sách (URL gốc cấp 1) |
| `/sitemap.xml`, `/robots.txt` | Tự sinh từ dữ liệu thật |
| `POST /api/leads/` | Nhận lead dạng JSON |

12 dòng xe: VF 8 All New, VF MPV 7, Limo Green, VF 3, VF 5, VF 6, VF 7, VF 9, EC Van,
Minio Green, Herio Green, Nerio Green.

---

## 4. Tối ưu SEO đã áp dụng

**Metadata**
- `generateMetadata` cho từng route: title, description, canonical, keywords.
- Open Graph + Twitter Card đầy đủ, `og:locale=vi_VN`, ảnh 1200×630.
- `metadataBase`, `robots` với `max-image-preview:large`, `max-snippet:-1`.
- Giữ nguyên dạng URL có dấu `/` cuối như bản gốc → không phát sinh redirect/mất backlink.

**Dữ liệu có cấu trúc (JSON-LD)**
- `AutoDealer` + `WebSite` (kèm `SearchAction`) ở layout gốc.
- `Car` + `AggregateOffer` cho từng trang xe (giá thấp nhất/cao nhất theo phiên bản).
- `FAQPage` ở trang xe, bảng giá, tính phí lăn bánh, trả góp.
- `NewsArticle` cho bài viết, `BreadcrumbList` mọi trang con, `ItemList` cho trang danh sách.

**HTML ngữ nghĩa & truy cập**
- Đúng 1 thẻ `h1` mỗi trang, phân cấp `h2`/`h3` theo nội dung.
- `header` / `nav` / `main` / `article` / `aside` / `footer`, skip-link tới nội dung chính.
- Breadcrumb hiển thị + `aria-current`, nhãn `aria-label` tiếng Việt cho mọi nút icon.
- Bảng dùng `caption`, `th scope`, form dùng `label` gắn `id`.
- **Toàn bộ ảnh đều có `alt` mô tả** (bản gốc có hàng trăm ảnh `alt` rỗng).

**Hiệu năng**
- Ảnh qua `next/image` (AVIF/WebP, `sizes` cho từng breakpoint, `priority` cho LCP).
- 419 ảnh được tải về `public/uploads` → không phụ thuộc domain gốc, cache 1 năm.
- Font `Be_Vietnam_Pro` self-host qua `next/font` (`display: swap`), preconnect gstatic.
- YouTube dùng facade (ảnh thumbnail) — chỉ nhúng iframe khi người dùng bấm play.
- Trang tĩnh/ISR, `optimizePackageImports` cho lucide-react.
- **CLS ≈ 0**: kích thước thật của toàn bộ ảnh được đo sẵn và ghi vào seed, nên trình duyệt
  luôn giữ đúng chỗ trước khi ảnh tải xong (đo thực tế: trang chủ 0.001, trang xe & bài viết 0.000).

---

## 5. Cấu trúc thư mục

```
src/
├─ app/
│  ├─ layout.tsx                 # font, metadata gốc, JSON-LD tổ chức
│  ├─ page.tsx                   # trang chủ
│  ├─ [slug]/page.tsx            # bài viết + trang chính sách (URL cấp 1)
│  ├─ xe/[slug]/page.tsx         # chi tiết xe
│  ├─ category/[slug]/page.tsx   # chuyên mục tin
│  ├─ actions/lead.ts            # Server Action nhận form
│  ├─ api/leads/route.ts         # REST endpoint nhận lead
│  ├─ sitemap.ts, robots.ts, icon.svg, apple-icon.svg
│  └─ ...các trang tĩnh
├─ components/
│  ├─ layout/                    # header dark + mega menu, mobile sheet, footer, floating CTA
│  ├─ car/                       # hero chọn màu, calculator, gallery lightbox, card, bảng giá
│  ├─ home/                      # hero slider, showroom gallery, youtube facade
│  ├─ news/, forms/, shared/     # post card, lead form, breadcrumb, JSON-LD
│  └─ ui/                        # shadcn/ui
├─ lib/
│  ├─ mongodb.ts                 # kết nối Mongoose có cache + fallback
│  ├─ models/                    # Car, Post, Page, Lead
│  ├─ repo.ts                    # tầng truy vấn (DB → JSON fallback)
│  ├─ calculator.ts              # công thức lăn bánh & lãi vay
│  ├─ seo.ts, site.ts, format.ts
├─ data/                         # seed: cars.json, content.json, site.json
└─ types/
public/uploads/                  # 419 ảnh lấy từ bản gốc
scripts/seed.mjs                 # nạp seed vào MongoDB
```

---

## 6. Công thức tính (giữ đúng bản gốc)

**Phí lăn bánh**

```
Lệ phí trước bạ   = 0            (ô tô điện được miễn 100%)
Phí đăng ký       = 1.000.000đ   (Đà Nẵng)
Bảo hiểm vật chất = 1.6% × giá xe
Phí cố định       = đường bộ 1.560.000 + đăng kiểm 340.000
                  + dịch vụ đăng ký 3.000.000 + BH bắt buộc 943.400
Tổng dự toán      = giá xe + trước bạ + đăng ký + bảo hiểm + phí cố định
Ưu đãi %          = (giá xe + tùy chọn thêm) × %
Giá sau ưu đãi    = tổng dự toán − tổng ưu đãi + tùy chọn thêm
```

**Lãi trả góp** — hai hình thức như bản gốc:
- *Dư nợ giảm dần*: gốc chia đều, lãi tính trên dư nợ còn lại.
- *Lãi chia đều*: lãi cố định `lãi suất × số tiền vay / 100 / 12` mỗi kỳ.

---

## 7. Ghi chú triển khai

- Đổi `NEXT_PUBLIC_SITE_URL` sang domain thật trước khi build (ảnh hưởng canonical, OG, sitemap).
- Thay số hotline / email / địa chỉ tại `src/data/site.json`.
- Website này là trang đại lý tham khảo, không phải trang chính thức của VinFast Việt Nam —
  nội dung miễn trừ trách nhiệm đã có sẵn ở footer và trang `/thong-tin-dai-ly-mien-tru-trach-nhiem/`.
