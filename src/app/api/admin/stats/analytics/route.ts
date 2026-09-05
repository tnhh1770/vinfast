import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCrmAnalytics, getCrmOverview } from "@/lib/crm-stats";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const [analytics, overview] = await Promise.all([getCrmAnalytics(), getCrmOverview()]);

  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    data: { ...analytics, summary: overview },
  });
}
