import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmBids } from "@/lib/crm-db";
import BidsClient from "./BidsClient";

export const metadata = {
  title: "Sàn đấu giá — CRM VinFast Đà Nẵng",
};

export default async function AdminActiveBidsPage() {
  await requireAdminUser();

  const bids = await getCrmBids();

  return <BidsClient initialBids={bids} />;
}
