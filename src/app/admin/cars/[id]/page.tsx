import "server-only";
import { getCrmCarBySlugOrId } from "@/lib/crm-db";
import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";

export const metadata = {
  title: "Chi Tiết Xe — CarEmpire CRM",
};

export default async function AdminCarInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCrmCarBySlugOrId(id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient initialCar={car} />;
}
