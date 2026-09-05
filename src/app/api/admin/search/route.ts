import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MOCK_AVAILABLE_CARS } from "@/lib/mock-crm-data";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";

  let results = MOCK_AVAILABLE_CARS;
  if (q) {
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.brand.toLowerCase().includes(q.toLowerCase()) ||
        c.style.toLowerCase().includes(q.toLowerCase())
    );
  }

  if (brand && brand !== "All Car's") {
    results = results.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    totalFound: results.length,
    data: results,
  });
}
