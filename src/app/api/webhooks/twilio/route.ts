import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";
import { normalizeTwilioPayload } from "@/lib/channels";
import { repo } from "@/lib/repo";
import { classifyAndExtract } from "@/lib/nlp";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const orgId = await getOrgIdFromAuth(req);
  const form = await req.formData();
  const entries = Object.fromEntries(form as any);
  const msg = normalizeTwilioPayload(entries);

  // TODO: validate Twilio signature with TWILIO_AUTH_TOKEN

  const threadId = await repo.threads.create(orgId, {
    customerId: null,
    channel: msg.channel,
    externalThreadId: msg.externalThreadId,
  });
  const nlu = await classifyAndExtract(msg.text || "");
  const messageId = await repo.threads.addMessage(orgId, threadId, {
    direction: "inbound",
    text: msg.text || "",
    attachments: msg.attachments ?? [],
    nlu,
  });

  return NextResponse.json({ ok: true, threadId, messageId, nlu });
}
