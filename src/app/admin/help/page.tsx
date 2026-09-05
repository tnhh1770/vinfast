import "server-only";
import { requireAdminUser } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Car,
  BarChart3,
  Settings,
  Terminal,
  LifeBuoy,
  Phone,
  Mail,
} from "lucide-react";
import { PHONE_HREF, site } from "@/lib/site";

export const metadata = {
  title: "Trợ giúp — CRM VinFast Đà Nẵng",
};

const GUIDES = [
  {
    icon: LayoutDashboard,
    title: "Tổng quan",
    href: "/admin",
    body: "Tổng quan số xe, hợp đồng, lead và giao dịch đang có trong cơ sở dữ liệu, kèm các nút thao tác nhanh sang từng phân hệ.",
  },
  {
    icon: Users,
    title: "Khách hàng tiềm năng",
    href: "/admin/leads",
    body: "Mọi form gửi từ website đổ về đây. Xem dạng Kanban để kéo lead qua từng bước phễu, hoặc dạng danh sách để lọc nhanh. Bấm vào một lead để gọi điện, mở Zalo, đổi trạng thái, đổi mức ưu tiên, gán cho nhân viên sales và ghi lịch sử chăm sóc. Nút “Xuất Excel/CSV” tải toàn bộ lead về máy.",
  },
  {
    icon: Briefcase,
    title: "Hợp đồng · Lịch hẹn · Giao xe · Đấu giá",
    href: "/admin/deals",
    body: "Bốn phân hệ vận hành: hợp đồng đặt cọc, lịch hẹn khách, theo dõi tình trạng giao xe và các phiên đấu giá. Mỗi mục đều thêm / sửa / xoá trực tiếp vào MongoDB.",
  },
  {
    icon: Car,
    title: "Kho xe & Bảng giá",
    href: "/admin/listing",
    body: "“Kho xe” quản lý bản ghi xe (thêm, sửa, xoá). “Bảng giá & Ưu đãi” chỉnh giá niêm yết và chương trình khuyến mãi của từng dòng xe. Mọi thay đổi được đẩy ra website công khai ngay sau khi lưu.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & Giao dịch",
    href: "/admin/statistics",
    body: "Báo cáo được tính trực tiếp từ dữ liệu thật: số lead theo tháng, tỉ lệ chốt đơn, doanh thu từ các giao dịch đã ghi nhận.",
  },
  {
    icon: Settings,
    title: "Cài đặt",
    href: "/admin/settings",
    body: "Cấu hình chung của đại lý (đơn vị tiền tệ, địa chỉ, thông báo) và khu vực tài khoản cá nhân: đổi họ tên, email và mật khẩu đăng nhập.",
  },
  {
    icon: Terminal,
    title: "Thử nghiệm API",
    href: "/admin/api-console",
    body: "Gọi thử trực tiếp các endpoint quản trị và xem response JSON — dùng khi cần kiểm tra dữ liệu hoặc tích hợp với hệ thống khác.",
  },
];

const FAQS = [
  {
    q: "Vì sao sửa giá xe trong CRM mà website chưa đổi ngay?",
    a: "Hệ thống đã tự làm mới cache của trang chủ, trang /xe/ và bảng giá ngay khi bạn lưu. Nếu trình duyệt vẫn hiện giá cũ, hãy tải lại trang bằng Ctrl + F5 để bỏ qua cache của trình duyệt.",
  },
  {
    q: "Tôi quên mật khẩu quản trị thì làm sao?",
    a: "Nhờ người có quyền admin vào mục “Người dùng” đặt lại mật khẩu cho tài khoản của bạn. Nếu không còn tài khoản admin nào, chạy lại lệnh `npm run seed:admin` trên máy chủ để tạo tài khoản quản trị mới.",
  },
  {
    q: "Vai trò “sales” khác “admin” ở chỗ nào?",
    a: "Sales dùng được toàn bộ nghiệp vụ bán hàng: xem và chăm sóc lead, tạo hợp đồng, đặt lịch hẹn. Các thao tác xoá dữ liệu và quản lý người dùng chỉ dành cho admin.",
  },
  {
    q: "Lead gửi từ website bao lâu thì hiện trong CRM?",
    a: "Ngay lập tức. Form trên website ghi thẳng vào collection `leads`; bạn chỉ cần bấm “Làm mới” ở thanh trên cùng.",
  },
];

export default async function AdminHelpPage() {
  await requireAdminUser();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
          <LifeBuoy className="h-6 w-6 text-blue-400" />
          <span>Trung tâm Hỗ trợ</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Hướng dẫn sử dụng các phân hệ của CRM đại lý VinFast Đà Nẵng.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Các phân hệ chính
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-all hover:border-blue-500/50"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold text-white transition-colors group-hover:text-blue-400">
                    {guide.title}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{guide.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Câu hỏi thường gặp
        </h2>
        <div className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group p-5">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200 transition-colors marker:hidden hover:text-blue-400">
                {faq.q}
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-5">
        <h2 className="text-sm font-bold text-white">Cần hỗ trợ thêm?</h2>
        <p className="mt-1 text-xs text-slate-300">
          Liên hệ quản trị viên hệ thống của đại lý.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a
            href={PHONE_HREF}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 font-semibold text-white hover:bg-blue-500"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{site.hotline}</span>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-semibold text-slate-200 hover:bg-slate-800"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{site.email}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
