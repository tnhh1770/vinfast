import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCrmOverview, getRecentActivity } from "@/lib/crm-stats";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const [overview, recentActivity] = await Promise.all([getCrmOverview(), getRecentActivity()]);

  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    data: { ...overview, recentActivity },
  });
}
