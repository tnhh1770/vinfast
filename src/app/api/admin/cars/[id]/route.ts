import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MOCK_AVAILABLE_CARS } from "@/lib/mock-crm-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const car = MOCK_AVAILABLE_CARS.find((c) => c.id === id || c.name.toLowerCase().includes(id.toLowerCase())) || MOCK_AVAILABLE_CARS[0];

  const carDetail = {
    ...car,
    specs: {
      class: "Compact executive car D",
      bodyAndChassis: "Front-engine, rear-wheel drive (4 MATIC)",
      predecessor: "Mercedes-Benz 190 E (W201)",
    },
    documentsNeeded: [
      "Bill of sale",
      "Buyer's Guide",
      "Country of title issuance",
      "Application of Texas / Local registration",
    ],
  };

  return NextResponse.json({ success: true, data: carDetail });
}
