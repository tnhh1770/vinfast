"use server";

import { leadSchema } from "@/lib/lead-schema";
import LeadModel from "@/lib/models/Lead";
import { connectToDatabase } from "@/lib/mongodb";

export interface LeadState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string>;
  /** Đổi sau mỗi lần gửi thành công để form tự làm mới. */
  token?: string;
}

export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại thông tin.",
      errors,
    };
  }

  // Bot điền honeypot -> giả vờ thành công, không lưu.
  if (parsed.data.website) {
    return {
      status: "success",
      message: "Đã gửi thông tin thành công.",
      token: `${Date.now()}`,
    };
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await LeadModel.create({
        name: parsed.data.name,
        phone: parsed.data.phone,
        carInterest: parsed.data.carInterest || undefined,
        message: parsed.data.message || undefined,
        source: parsed.data.source,
        path: parsed.data.path || undefined,
      });
    } else {
      console.info("[lead] (chưa cấu hình DB) ", parsed.data);
    }
  } catch (error) {
    console.error("[lead] Lưu thất bại", error);
    return {
      status: "error",
      message: "Có lỗi xảy ra. Vui lòng gọi hotline 0906 412 894.",
    };
  }

  return {
    status: "success",
    message: "Cảm ơn bạn! Tư vấn viên sẽ liên hệ lại trong ít phút.",
    token: `${Date.now()}`,
  };
}
