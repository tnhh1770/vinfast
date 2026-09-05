import "server-only";
import { getCrmCalendarEvents } from "@/lib/crm-db";
import CalendarClient from "./CalendarClient";

export const metadata = {
  title: "Quản Lý Lịch Hẹn Calendar — CarEmpire CRM",
};

export default async function AdminCalendarPage() {
  const events = await getCrmCalendarEvents();

  return <CalendarClient initialEvents={events} />;
}
