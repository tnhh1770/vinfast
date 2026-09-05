import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import { getSessionUser } from "@/lib/auth";
import type { Lead } from "@/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let leads: Lead[] = [];
  const conn = await connectToDatabase();
  if (conn) {
    const docs = await LeadModel.find({}).sort({ createdAt: -1 }).lean();
    leads = JSON.parse(JSON.stringify(docs));
  }

  // Generate CSV string with UTF-8 BOM
  const headers = ["ID", "Họ Tên", "Số Điện Thoại", "Xe Quan Tâm", "Trạng Thái", "Mức Ưu Tiên", "Người Chăm Sóc", "Nguồn", "Ghi Chú Ban Đầu", "Ngày Tạo"];
  const rows = leads.map((l) => [
    String(l._id || ""),
    `"${(l.name || "").replace(/"/g, '""')}"`,
    `"${(l.phone || "").replace(/"/g, '""')}"`,
    `"${(l.carInterest || "").replace(/"/g, '""')}"`,
    `"${getStatusLabel(l.status || "new")}"`,
    `"${getPriorityLabel(l.priority || "medium")}"`,
    `"${(l.assignedTo || "").replace(/"/g, '""')}"`,
    `"${(l.source || "").replace(/"/g, '""')}"`,
    `"${(l.message || "").replace(/"/g, '""')}"`,
    `"${l.createdAt ? new Date(l.createdAt).toLocaleString("vi-VN") : ""}"`,
  ]);

  const bom = "\uFEFF";
  const csvContent = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vinfast-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "new":
      return "Mới";
    case "contacted":
      return "Đã liên hệ";
    case "test_drive":
      return "Hẹn lái thử";
    case "negotiating":
      return "Báo giá / Thương lượng";
    case "won":
      return "Thành công";
    case "lost":
      return "Thất bại";
    default:
      return status;
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "low":
      return "Thấp";
    case "medium":
      return "Trung bình";
    case "high":
      return "Cao";
    case "urgent":
      return "Khẩn cấp";
    default:
      return priority;
  }
}
