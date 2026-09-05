import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmCars } from "@/lib/crm-db";
import ListingClient from "./ListingClient";

export const metadata = {
  title: "Kho xe — CRM VinFast Đà Nẵng",
};

export default async function AdminListingPage() {
  await requireAdminUser();

  const cars = await getCrmCars();

  return <ListingClient initialCars={cars} />;
}
