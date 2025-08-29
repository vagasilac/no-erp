import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/repo";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";

export async function POST(req: NextRequest) {
  const orgId = await getOrgIdFromAuth(req);
  const { threadId } = await req.json();
  if (!threadId) return NextResponse.json({ ok: false, message: "threadId required" }, { status: 400 });
  await repo.threads.delete(orgId, threadId);
  // TODO: delete storage files under orgs/{orgId}/threads/{threadId}/
  return NextResponse.json({ ok: true });
}
