"use server";

import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import { verifyPassword, setSessionCookie, removeSessionCookie } from "@/lib/auth";

export interface LoginState {
  status: "idle" | "error" | "success";
  message: string;
}

export async function loginAdminAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      status: "error",
      message: "Vui lòng nhập đầy đủ Email và Mật khẩu.",
    };
  }

  let success = false;

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      // Fallback dev demo login if DB is not configured
      if (email === "admin@vinfastdanang.net" && password === "admin123") {
        await setSessionCookie({
          id: "demo-admin-id",
          email: "admin@vinfastdanang.net",
          name: "Quản trị viên Demo",
          role: "admin",
        });
        success = true;
      } else {
        return {
          status: "error",
          message: "Email hoặc mật khẩu không chính xác. Dùng admin@vinfastdanang.net / admin123 để thử nghiệm.",
        };
      }
    } else {
      const user = await UserModel.findOne({ email }).lean();
      if (!user) {
        return {
          status: "error",
          message: "Email hoặc mật khẩu không chính xác.",
        };
      }

      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return {
          status: "error",
          message: "Email hoặc mật khẩu không chính xác.",
        };
      }

      await setSessionCookie({
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      });

      success = true;
    }
  } catch (err) {
    console.error("[auth] Đăng nhập thất bại:", err);
    return {
      status: "error",
      message: "Có lỗi xảy ra trong quá trình xử lý.",
    };
  }

  if (success) {
    redirect("/admin/");
  }

  return { status: "error", message: "Đăng nhập không thành công." };
}

export async function logoutAdminAction() {
  await removeSessionCookie();
  redirect("/admin/login/");
}
