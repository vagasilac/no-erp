import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getOrgId } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const orgId = getOrgId(req);
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("id");
  if (!threadId) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const tRef = db.collection("orgs").doc(orgId).collection("threads").doc(threadId);
  const tSnap = await tRef.get();
  if (!tSnap.exists) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const msgs = await tRef.collection("messages").orderBy("createdAt", "asc").get();
  const payload = {
    thread: { id: tSnap.id, ...tSnap.data() },
    messages: msgs.docs.map(d => ({ id: d.id, ...d.data() })),
  };

  return NextResponse.json({ ok: true, data: payload });
}
