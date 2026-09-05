import "server-only";
import { getCrmSettings } from "@/lib/crm-db";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Cài Đặt CRM Settings — CarEmpire CRM",
};

export default async function AdminSettingsPage() {
  const settings = (await getCrmSettings()) as Record<string, unknown>;

  return <SettingsClient initialSettings={settings} />;
}
