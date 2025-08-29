import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/repo";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";
import { classifyAndExtract } from "@/lib/nlp";

export async function POST(req: NextRequest) {
  const orgId = await getOrgIdFromAuth(req);
  const body = await req.json();
  const { from, subject, text, threadKey } = body;

  const customer = await repo.customers.upsertByDisplayName(orgId, from);
  const threadId = await repo.threads.create(orgId, {
    customerId: customer.id,
    channel: 'email',
    externalThreadId: threadKey || from
  });
  const textBody = `${subject}\n${text}`;
  const nlu = await classifyAndExtract(textBody);
  const messageId = await repo.threads.addMessage(orgId, threadId, {
    direction: 'inbound',
    text: textBody,
    nlu
  });
  return NextResponse.json({ ok: true, threadId, messageId, nlu });
}
