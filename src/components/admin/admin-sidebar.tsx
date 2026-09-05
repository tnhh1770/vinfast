"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar as CalendarIcon,
  Briefcase,
  Navigation,
  Gavel,
  BarChart3,
  CreditCard,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "@/app/actions/auth";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Listing", href: "/admin/listing", icon: Car },
    { title: "Calendar", href: "/admin/calendar", icon: CalendarIcon },
    { title: "Deals", href: "/admin/deals", icon: Briefcase },
    { title: "Tracking", href: "/admin/tracking", icon: Navigation },
    { title: "Active Bids", href: "/admin/active-bids", icon: Gavel },
    { title: "Statistics", href: "/admin/statistics", icon: BarChart3 },
    { title: "Transaction", href: "/admin/transaction", icon: CreditCard },
  ];

  const otherNavItems = [
    { title: "Search", href: "/admin/search", icon: Search },
    { title: "Settings", href: "/admin/settings", icon: Settings },
    { title: "Help Center", href: "/admin/help", icon: HelpCircle },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-all duration-300 ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Header / Brand Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white">
              C
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-blue-400">CarEmpire</span>
              <span className="text-[10px] font-normal text-slate-400">Dealership CRM</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            C
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Menu Nav */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        <div>
          {!collapsed && (
            <span className="block px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Menu
            </span>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <span className="block px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Other Menu
            </span>
          )}
          <nav className="space-y-1">
            {otherNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden text-xs">
              <span className="truncate font-semibold text-slate-200">{user.name || "Admin"}</span>
              <span className="truncate text-slate-400">{user.email}</span>
            </div>
          )}
          <button
            onClick={() => logoutAdminAction()}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
