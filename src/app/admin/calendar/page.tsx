import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmCalendarEvents } from "@/lib/crm-db";
import CalendarClient from "./CalendarClient";

export const metadata = {
  title: "Lịch hẹn — CRM VinFast Đà Nẵng",
};

export default async function AdminCalendarPage() {
  await requireAdminUser();

  const events = await getCrmCalendarEvents();

  return <CalendarClient initialEvents={events} />;
}
