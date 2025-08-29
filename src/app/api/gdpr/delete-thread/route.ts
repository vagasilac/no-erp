import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db, bucket } from "@/lib/firebase-admin";
import { getOrgId } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const orgId = getOrgId(req);
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const tRef = db.collection("orgs").doc(orgId).collection("threads").doc(id);
  const msgs = await tRef.collection("messages").get();
  const batch = db.batch();
  msgs.forEach(doc => batch.delete(doc.ref));
  batch.delete(tRef);
  await batch.commit();

  const [files] = await bucket.getFiles({ prefix: `orgs/${orgId}/threads/${id}/` });
  await Promise.all(files.map(f => f.delete()));

  return NextResponse.json({ ok: true });
}
