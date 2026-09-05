import "server-only";
import { getCrmDeals } from "@/lib/crm-db";
import DealsClient from "./DealsClient";

export const metadata = {
  title: "Quản Lý Deals Hợp Đồng — CarEmpire CRM",
};

export default async function AdminDealsPage() {
  const deals = await getCrmDeals();

  return <DealsClient initialDeals={deals} />;
}
