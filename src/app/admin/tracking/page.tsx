import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmTrackings } from "@/lib/crm-db";
import TrackingClient from "./TrackingClient";

export const metadata = {
  title: "Theo dõi giao xe — CRM VinFast Đà Nẵng",
};

export default async function AdminTrackingPage() {
  await requireAdminUser();

  const trackings = await getCrmTrackings();

  return <TrackingClient initialTrackings={trackings} />;
}
