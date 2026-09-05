import "server-only";
import { getCrmSettings } from "@/lib/crm-db";
import { SettingsClient, type CrmSettingsData } from "@/components/admin/settings-client";

export const metadata = {
  title: "Settings — CarEmpire CRM",
};

export default async function AdminSettingsPage() {
  const initialSettings = (await getCrmSettings()) as CrmSettingsData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cấu hình Hệ thống CRM (MongoDB)</h1>
        <p className="text-xs text-slate-400 mt-0.5">Lưu trữ và đọc cấu hình trực tiếp từ CSDL MongoDB</p>
      </div>

      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}
