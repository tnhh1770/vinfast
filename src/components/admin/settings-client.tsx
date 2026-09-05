"use client";

import { useState } from "react";
import { User, Bell, CreditCard, Lock, Save } from "lucide-react";
import { toast } from "sonner";

export interface CrmSettingsData {
  name?: string;
  email?: string;
  currency?: string;
  address?: string;
  state?: string;
  language?: string;
}

interface SettingsClientProps {
  initialSettings?: CrmSettingsData;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "account" | "notification" | "payment" | "security">("general");

  const [formData, setFormData] = useState({
    firstName: (initialSettings?.name || "Quản trị viên").split(" ")[0] || "Quản trị viên",
    lastName: (initialSettings?.name || "VinFast Đà Nẵng").split(" ").slice(1).join(" ") || "VinFast Đà Nẵng",
    email: String(initialSettings?.email || "admin@vinfastdanang.net"),
    currency: String(initialSettings?.currency || "VND"),
    address: String(initialSettings?.address || "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng"),
    state: String(initialSettings?.state || "Đà Nẵng"),
    language: String(initialSettings?.language || "Vietnamese"),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Đã lưu cài đặt hệ thống CRM thành công vào MongoDB!");
      }
    } catch {
      toast.error("Lưu thất bại.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sub-menu Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm space-y-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "general" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "account" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Account Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("notification")}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "notification" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notification</span>
        </button>

        <button
          onClick={() => setActiveTab("payment")}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "payment" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Bill Payment</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "security" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Main Settings Form Container */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 uppercase tracking-wider text-xs">
            {activeTab} Settings (MongoDB Database)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Your Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">Currency Used</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="VND">VND (₫)</option>
                <option value="Dollar">Dollar ($)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Lưu vào DB MongoDB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
