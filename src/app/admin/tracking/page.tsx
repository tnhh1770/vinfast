import "server-only";
import { getCrmTrackings } from "@/lib/crm-db";
import TrackingClient from "./TrackingClient";

export const metadata = {
  title: "Quản Lý Lead Tracking — CarEmpire CRM",
};

export default async function AdminTrackingPage() {
  const trackings = await getCrmTrackings();

  return <TrackingClient initialTrackings={trackings} />;
}
