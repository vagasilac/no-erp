import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/repo";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";

export async function GET(req: NextRequest) {
  const orgId = await getOrgIdFromAuth(req);
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');
  if (!threadId) return NextResponse.json({ ok: false, message: 'threadId required' }, { status: 400 });
  const data = await repo.threads.export(orgId, threadId);
  return NextResponse.json({ ok: true, data });
}
