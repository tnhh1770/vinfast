import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MOCK_STATISTICS } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: MOCK_STATISTICS,
  });
}
