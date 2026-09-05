"use client";

import Link from "next/link";
import { ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { USER_ROLE } from "@/lib/crm-labels";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div className="flex items-center gap-4">
        {/* Không dùng <h1>: mỗi trang con đã có h1 riêng, giữ đúng 1 h1/trang. */}
        <span className="text-lg font-semibold text-slate-100">Cổng Quản trị CRM — VinFast Đà Nẵng</span>
        <span
          className={`hidden items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold sm:flex ${
            user.role === "admin"
              ? "border border-purple-800/50 bg-purple-950 text-purple-300"
              : "border border-blue-800/50 bg-blue-950 text-blue-300"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            {user.name} · {USER_ROLE[user.role] || user.role}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Làm mới</span>
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Xem trang web</span>
        </Link>
      </div>
    </header>
  );
}
