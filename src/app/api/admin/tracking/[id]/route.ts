import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { MOCK_TRACKINGS } from "@/lib/mock-crm-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tracking = MOCK_TRACKINGS.find((t) => t._id === id) || MOCK_TRACKINGS[0];

  return NextResponse.json({ success: true, data: tracking });
}
