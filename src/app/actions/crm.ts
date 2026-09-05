"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import CarModel from "@/lib/models/Car";
import { getSessionUser } from "@/lib/auth";
import { revalidateCarPages } from "@/lib/revalidate";
import type { LeadStatus, LeadPriority, CarPromotion } from "@/types";

/**
 * Kết quả của mọi Server Action trong CRM.
 *
 * Cố tình trả về object thay vì `throw`: Next che lỗi của Server Action trong bản
 * production nên phía client chỉ nhận được thông báo chung chung, khiến thao tác
 * thất bại trông như "bấm mà không có gì xảy ra". Trả lý do cụ thể để giao diện
 * hiển thị đúng nguyên nhân.
 */
export interface ActionResult {
  success: boolean;
  message?: string;
}

const NOT_SIGNED_IN: ActionResult = {
  success: false,
  message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
};

const NO_DATABASE: ActionResult = {
  success: false,
  message: "Không kết nối được cơ sở dữ liệu.",
};

export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const updated = await LeadModel.findByIdAndUpdate(leadId, {
    status,
    $push: {
      notes: {
        content: `Chuyển trạng thái sang: ${getStatusLabel(status)}`,
        author: user.name || user.email,
        createdAt: new Date(),
      },
    },
  });
  if (!updated) return { success: false, message: "Không tìm thấy khách hàng này." };

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return { success: true, message: "Đã cập nhật trạng thái." };
}

export async function updateLeadPriorityAction(
  leadId: string,
  priority: LeadPriority,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const updated = await LeadModel.findByIdAndUpdate(leadId, { priority });
  if (!updated) return { success: false, message: "Không tìm thấy khách hàng này." };

  revalidatePath("/admin/leads");
  return { success: true, message: "Đã cập nhật mức ưu tiên." };
}

export async function addLeadNoteAction(leadId: string, content: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;

  if (!content.trim()) {
    return { success: false, message: "Nội dung ghi chú không được để trống." };
  }

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const updated = await LeadModel.findByIdAndUpdate(leadId, {
    $push: {
      notes: {
        content: content.trim(),
        author: user.name || user.email,
        createdAt: new Date(),
      },
    },
  });
  if (!updated) return { success: false, message: "Không tìm thấy khách hàng này." };

  revalidatePath("/admin/leads");
  return { success: true, message: "Đã thêm ghi chú." };
}

export async function assignLeadAction(leadId: string, assignedTo: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const updated = await LeadModel.findByIdAndUpdate(leadId, {
    assignedTo,
    $push: {
      notes: {
        content: assignedTo
          ? `Gán khách hàng cho: ${assignedTo}`
          : "Bỏ gán nhân viên phụ trách",
        author: user.name || user.email,
        createdAt: new Date(),
      },
    },
  });
  if (!updated) return { success: false, message: "Không tìm thấy khách hàng này." };

  revalidatePath("/admin/leads");
  return {
    success: true,
    message: assignedTo ? `Đã gán cho ${assignedTo}.` : "Đã bỏ gán nhân viên phụ trách.",
  };
}

export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;
  if (user.role !== "admin") {
    return { success: false, message: "Chỉ quản trị viên mới được xoá khách hàng." };
  }

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const deleted = await LeadModel.findByIdAndDelete(leadId);
  if (!deleted) return { success: false, message: "Không tìm thấy khách hàng này." };

  revalidatePath("/admin/leads");
  return { success: true, message: "Đã xoá khách hàng." };
}

export async function updateCarPricingAction(
  slug: string,
  price: number,
  promotions: CarPromotion[],
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return NOT_SIGNED_IN;
  if (user.role !== "admin") {
    return { success: false, message: "Chỉ quản trị viên mới được sửa bảng giá." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { success: false, message: "Giá xe không hợp lệ." };
  }

  const conn = await connectToDatabase();
  if (!conn) return NO_DATABASE;

  const updated = await CarModel.findOneAndUpdate(
    { slug },
    { price, promotions },
    { upsert: false },
  );
  if (!updated) return { success: false, message: "Không tìm thấy dòng xe này." };

  revalidateCarPages(slug);
  revalidatePath("/admin/cars");
  return { success: true, message: "Đã cập nhật giá xe." };
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
