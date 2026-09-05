import "server-only";
import { getCrmCars } from "@/lib/crm-db";
import ListingClient from "./ListingClient";

export const metadata = {
  title: "Quản Lý Xe Listing — CarEmpire CRM",
};

export default async function AdminListingPage() {
  const cars = await getCrmCars();

  return <ListingClient initialCars={cars} />;
}
