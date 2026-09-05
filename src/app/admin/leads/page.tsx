import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import { getSessionUser } from "@/lib/auth";
import type { Lead } from "@/types";
import { LeadManagementClient } from "@/components/admin/leads/lead-management-client";

export const metadata = {
  title: "Quản lý Leads CRM — VinFast Đà Nẵng",
};

export default async function AdminLeadsPage() {
  const user = await getSessionUser();

  let leads: Lead[] = [];
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await LeadModel.find({}).sort({ createdAt: -1 }).lean();
    leads = JSON.parse(JSON.stringify(docs));
  } else {
    // Demo lead when DB is not connected
    leads = [
      {
        _id: "demo-1",
        name: "Nguyễn Văn An",
        phone: "0905123456",
        carInterest: "VF 3",
        message: "Cần tư vấn gói trả góp 80% tại Đà Nẵng",
        source: "Bảng giá",
        path: "/bang-gia-xe/",
        status: "new",
        priority: "high",
        createdAt: "2026-09-05T08:00:00.000Z",
        notes: [
          { content: "Khách gọi từ banner trang chủ", author: "Hệ thống", createdAt: "2026-09-05T08:00:00.000Z" },
        ],
      },
      {
        _id: "demo-2",
        name: "Trần Thị Mai",
        phone: "0914987654",
        carInterest: "VF 8 All New",
        message: "Muốn đặt lịch lái thử vào Thứ 7 tuần này",
        source: "Đăng ký lái thử",
        path: "/dang-ky-lai-thu/",
        status: "test_drive",
        priority: "urgent",
        createdAt: "2026-09-04T14:30:00.000Z",
      },
      {
        _id: "demo-3",
        name: "Lê Hoàng Nam",
        phone: "0988112233",
        carInterest: "VF MPV 7",
        message: "Hỏi giá bánh xe và khuyến mãi đại lý",
        source: "Trang chủ",
        path: "/",
        status: "negotiating",
        priority: "medium",
        createdAt: "2026-09-03T09:15:00.000Z",
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Khách hàng Tiềm năng (CRM Leads)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi phễu bán hàng, chốt đơn, lái thử & tương tác khách hàng đại lý VinFast Đà Nẵng
          </p>
        </div>
      </div>

      <LeadManagementClient initialLeads={leads} userRole={user?.role || "sales"} />
    </div>
  );
}
