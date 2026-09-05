import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

const SESSION_COOKIE = "admin_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  // Đã đăng nhập mà vào lại trang login -> đưa thẳng vào dashboard.
  if (isLoginPage) {
    if (session) return NextResponse.redirect(new URL("/admin/", request.url));
    return NextResponse.next();
  }

  if (session) return NextResponse.next();

  // Chữ ký sai / hết hạn / không có: API trả JSON 401, trang thì ép đăng nhập lại.
  if (isApi) {
    const response = NextResponse.json(
      { success: false, message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
      { status: 401 },
    );
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const loginUrl = new URL("/admin/login/", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  const response = NextResponse.redirect(loginUrl);
  if (token) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Chặn cả trang quản trị lẫn API quản trị.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
