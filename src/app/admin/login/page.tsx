"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAdminAction, type LoginState } from "@/app/actions/auth";
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const initialState: LoginState = {
  status: "idle",
  message: "",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-extrabold text-2xl text-white shadow-lg shadow-blue-600/40">
            V
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">VinFast Đà Nẵng CRM</h2>
          <p className="text-sm text-slate-400">Đăng nhập cổng quản trị & chăm sóc khách hàng</p>
        </div>

        {/* Status Error Alert */}
        {state.status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold">Đăng nhập không thành công</p>
              <p className="mt-0.5">{state.message}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email Quản trị
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                placeholder="admin@vinfastdanang.net"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
            ← Quay lại trang chủ VinFast Đà Nẵng
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Đang tải…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
