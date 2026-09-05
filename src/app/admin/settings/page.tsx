import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmSettings } from "@/lib/crm-db";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Cài đặt — CRM VinFast Đà Nẵng",
};

export default async function AdminSettingsPage() {
  const user = await requireAdminUser();

  const settings = (await getCrmSettings()) as Record<string, unknown>;

  return (
    <SettingsClient
      initialSettings={settings}
      currentUser={{ name: user.name, email: user.email, role: user.role }}
    />
  );
}
