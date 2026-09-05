import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import type { AdminUser } from "@/types";

const SESSION_COOKIE = "admin_session";

/** Khoá ký cookie phiên. Đổi khoá này = buộc mọi người đăng nhập lại. */
const SECRET_KEY = process.env.JWT_SECRET || "vinfast-danang-crm-secret-key-2026";

/**
 * Khoá băm mật khẩu — CỐ TÌNH tách khỏi `JWT_SECRET`.
 * Nếu dùng chung, việc xoay khoá phiên sẽ làm mọi mật khẩu đã lưu mất hiệu lực
 * và không ai đăng nhập lại được. Giữ mặc định cũ để các hash đã seed vẫn khớp.
 */
const PASSWORD_SECRET =
  process.env.PASSWORD_SECRET || "vinfast-danang-crm-secret-key-2026";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[auth] Thiếu JWT_SECRET — đang dùng khoá mặc định trong mã nguồn. " +
      "Hãy đặt JWT_SECRET trong biến môi trường trước khi chạy production.",
  );
}

export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", PASSWORD_SECRET)
    .update(password)
    .digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  if (typeof hash !== "string" || computed.length !== hash.length) return false;
  // So sánh hằng thời gian để không lộ thông tin qua timing attack.
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export function createToken(payload: { id: string; email: string; name: string; role: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
  return Buffer.from(`${data}.${signature}`).toString("base64url");
}

export function verifyToken(token: string): { id: string; email: string; name: string; role: string } | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;

    const dataStr = raw.substring(0, lastDot);
    const sig = raw.substring(lastDot + 1);

    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(dataStr).digest("hex");
    if (sig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const parsed = JSON.parse(dataStr);
    if (parsed.exp < Date.now()) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    _id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role as "admin" | "sales",
  };
}

export async function setSessionCookie(user: { id: string; email: string; name: string; role: string }) {
  const token = createToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Dùng ở đầu mỗi trang trong `/admin` để không phụ thuộc hoàn toàn vào middleware.
 * Không có session hợp lệ -> đá về trang đăng nhập thay vì render dữ liệu khách hàng.
 */
export async function requireAdminUser(redirectTo?: string): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) {
    const target = redirectTo
      ? `/admin/login/?redirect=${encodeURIComponent(redirectTo)}`
      : "/admin/login/";
    redirect(target);
  }
  return user;
}

/** Chỉ cho phép role `admin` (thao tác xoá, quản lý người dùng...). */
export async function requireRole(role: AdminUser["role"]): Promise<AdminUser> {
  const user = await requireAdminUser();
  if (user.role !== role) {
    redirect("/admin/");
  }
  return user;
}
