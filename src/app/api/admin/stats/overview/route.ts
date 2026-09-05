import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MOCK_AVAILABLE_CARS, MOCK_RECENT_ACTIVITIES } from "@/lib/mock-crm-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      stats7Days: {
        availableCarsCount: MOCK_AVAILABLE_CARS.length,
        totalBids: 47,
        totalDeals: 148,
        totalRevenueUsd: 1285892,
      },
      availableCars: MOCK_AVAILABLE_CARS,
      recentActivity: MOCK_RECENT_ACTIVITIES,
    },
  });
}
