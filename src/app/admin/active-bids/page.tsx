import "server-only";
import { getCrmBids } from "@/lib/crm-db";
import BidsClient from "./BidsClient";

export const metadata = {
  title: "Quản Lý Đấu Giá Bids — CarEmpire CRM",
};

export default async function AdminActiveBidsPage() {
  const bids = await getCrmBids();

  return <BidsClient initialBids={bids} />;
}
