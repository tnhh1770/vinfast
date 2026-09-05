"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import CarModel from "@/lib/models/Car";
import { getSessionUser } from "@/lib/auth";
import type { LeadStatus, LeadPriority, Lead, CarPromotion } from "@/types";

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const user = await getSessionUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const conn = await connectToDatabase();
  if (conn) {
    await LeadModel.findByIdAndUpdate(leadId, {
      status,
      $push: {
        notes: {
          content: `Chuyển trạng thái sang: ${getStatusLabel(status)}`,
          author: user.name || user.email,
          createdAt: new Date(),
        },
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function updateLeadPriorityAction(leadId: string, priority: LeadPriority) {
  const user = await getSessionUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const conn = await connectToDatabase();
  if (conn) {
    await LeadModel.findByIdAndUpdate(leadId, { priority });
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function addLeadNoteAction(leadId: string, content: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Chưa đăng nhập");

  if (!content.trim()) return { success: false, message: "Nội dung ghi chú không được trống." };

  const conn = await connectToDatabase();
  if (conn) {
    await LeadModel.findByIdAndUpdate(leadId, {
      $push: {
        notes: {
          content: content.trim(),
          author: user.name || user.email,
          createdAt: new Date(),
        },
      },
    });
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function assignLeadAction(leadId: string, assignedTo: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const conn = await connectToDatabase();
  if (conn) {
    await LeadModel.findByIdAndUpdate(leadId, {
      assignedTo,
      $push: {
        notes: {
          content: `Gán khách hàng cho Sales: ${assignedTo}`,
          author: user.name || user.email,
          createdAt: new Date(),
        },
      },
    });
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") throw new Error("Không có quyền thao tác.");

  const conn = await connectToDatabase();
  if (conn) {
    await LeadModel.findByIdAndDelete(leadId);
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

export async function updateCarPricingAction(slug: string, price: number, promotions: CarPromotion[]) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") throw new Error("Không có quyền thao tác.");

  const conn = await connectToDatabase();
  if (conn) {
    await CarModel.findOneAndUpdate({ slug }, { price, promotions }, { upsert: false });
  }

  revalidatePath("/admin/cars");
  revalidatePath(`/xe/${slug}`);
  revalidatePath("/bang-gia-xe");
  return { success: true };
}

function getStatusLabel(status: LeadStatus): string {
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
      return "Thành công (Chốt đơn)";
    case "lost":
      return "Thất bại / Hủy";
    default:
      return status;
  }
}
