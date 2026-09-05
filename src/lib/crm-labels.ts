/**
 * Nhãn tiếng Việt cho các giá trị enum của CRM.
 *
 * Giá trị lưu trong MongoDB vẫn giữ nguyên tiếng Anh (`Pending`, `Paid`,
 * `In Transit`…) để không phải migrate dữ liệu và không phá `enum` trong schema;
 * chỉ phần hiển thị ra giao diện mới dịch sang tiếng Việt.
 */

/** Lớp Tailwind cho badge trạng thái, gom cùng nhãn để mọi màn hình hiển thị giống nhau. */
export interface LabelMeta {
  label: string;
  className: string;
}

export const DEAL_STATUS: Record<string, LabelMeta> = {
  Pending: { label: "Chờ xử lý", className: "border-amber-800/40 bg-amber-950 text-amber-300" },
  Signed: { label: "Đã ký", className: "border-blue-800/40 bg-blue-950 text-blue-300" },
  Completed: { label: "Hoàn tất", className: "border-emerald-800/40 bg-emerald-950 text-emerald-300" },
  Cancelled: { label: "Đã huỷ", className: "border-rose-800/40 bg-rose-950 text-rose-300" },
};

export const TRANSACTION_STATUS: Record<string, LabelMeta> = {
  Paid: { label: "Đã thanh toán", className: "border-emerald-800/40 bg-emerald-950 text-emerald-300" },
  Pending: { label: "Chờ thanh toán", className: "border-amber-800/40 bg-amber-950 text-amber-300" },
  Failed: { label: "Thất bại", className: "border-rose-800/40 bg-rose-950 text-rose-300" },
};

export const TRACKING_STATUS: Record<string, LabelMeta> = {
  "In Transit": { label: "Đang giao", className: "border-blue-800/50 bg-blue-950 text-blue-300" },
  Delivered: { label: "Đã giao", className: "border-emerald-800/50 bg-emerald-950 text-emerald-300" },
  Pending: { label: "Chờ giao", className: "border-amber-800/50 bg-amber-950 text-amber-300" },
};

export const BID_STATUS: Record<string, LabelMeta> = {
  Active: { label: "Đang mở", className: "border-emerald-800/50 bg-emerald-950 text-emerald-300" },
  Closed: { label: "Đã đóng", className: "border-slate-700 bg-slate-800 text-slate-400" },
};

export const CALENDAR_TYPE: Record<string, LabelMeta> = {
  TestDrive: { label: "Lái thử", className: "border-emerald-800/50 bg-emerald-950 text-emerald-300" },
  Delivery: { label: "Bàn giao xe", className: "border-blue-800/50 bg-blue-950 text-blue-300" },
  Maintenance: { label: "Bảo dưỡng", className: "border-amber-800/50 bg-amber-950 text-amber-300" },
  Meeting: { label: "Gặp mặt tư vấn", className: "border-purple-800/50 bg-purple-950 text-purple-300" },
};

/** Hình thức thanh toán dùng chung cho hợp đồng và giao dịch. */
export const PAYMENT_METHOD: Record<string, LabelMeta> = {
  Cash: { label: "Tiền mặt", className: "border-emerald-800/40 bg-emerald-950 text-emerald-300" },
  Card: { label: "Thẻ", className: "border-purple-800/40 bg-purple-950 text-purple-300" },
  Transfer: { label: "Chuyển khoản", className: "border-blue-800/40 bg-blue-950 text-blue-300" },
};

export const USER_ROLE: Record<string, string> = {
  admin: "Quản trị viên",
  sales: "Nhân viên kinh doanh",
};

/** Lấy nhãn an toàn: giá trị lạ (dữ liệu cũ) thì hiển thị nguyên văn thay vì để trống. */
export function labelOf(map: Record<string, LabelMeta>, value?: string): LabelMeta {
  if (value && map[value]) return map[value];
  return { label: value || "—", className: "border-slate-700 bg-slate-800 text-slate-400" };
}
