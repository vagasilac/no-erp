import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { repo } from "@/lib/repo";
import { getOrgId } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const orgId = getOrgId(req);
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  const [openOrders, dueOrders] = await Promise.all([
    repo.orders.countOpen(orgId),
    repo.orders.dueInRange(orgId, now.toISOString(), in7.toISOString()),
  ]);

  return NextResponse.json({
    kpis: { openOrders, dueThisWeek: dueOrders.length },
    orders: dueOrders,
  });
}
