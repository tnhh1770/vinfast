"use client";

import Link from "next/link";
import { Bell, Search, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

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
        <h1 className="text-lg font-semibold text-slate-100">Cổng Quản trị CRM — VinFast Đà Nẵng</h1>
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
          <span>Xem Website</span>
        </Link>
      </div>
    </header>
  );
}
