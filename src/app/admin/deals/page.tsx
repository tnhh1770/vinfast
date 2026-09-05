import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmDeals } from "@/lib/crm-db";
import DealsClient from "./DealsClient";

export const metadata = {
  title: "Hợp đồng — CRM VinFast Đà Nẵng",
};

export default async function AdminDealsPage() {
  await requireAdminUser();

  const deals = await getCrmDeals();

  return <DealsClient initialDeals={deals} />;
}
