import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/repo";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";

export async function GET(req: NextRequest) {
  const orgId = await getOrgIdFromAuth(req);
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const orders = await repo.orders.dueInRange(orgId, now.toISOString(), in7.toISOString());
  const openOrders = orders.filter(o => ["pending_confirm","confirmed","in_production"].includes(o.status)).length;
  const dueThisWeek = orders.length;
  // TODO: consider aggregations for large datasets
  return NextResponse.json({ kpis: { openOrders, dueThisWeek }, orders });
}
