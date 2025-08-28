import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrgId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const orgId = getOrgId(req);
  const openOrders = await prisma.order.count({ where: { orgId, status: { in: ["pending_confirm","confirmed","in_production"] } } });
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const dueThisWeek = await prisma.order.count({ where: { orgId, dueDate: { gte: now, lte: in7 } } });
  const orders = await prisma.order.findMany({ where: { orgId, dueDate: { gte: now, lte: in7 } }, orderBy: { dueDate: "asc" } });

  return NextResponse.json({ kpis: { openOrders, dueThisWeek }, orders });
}
