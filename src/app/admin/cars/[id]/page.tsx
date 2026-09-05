import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmCarBySlugOrId } from "@/lib/crm-db";
import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";

export const metadata = {
  title: "Chi tiết xe — CRM VinFast Đà Nẵng",
};

export default async function AdminCarInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();

  const { id } = await params;
  const car = await getCrmCarBySlugOrId(id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient initialCar={car} />;
}
