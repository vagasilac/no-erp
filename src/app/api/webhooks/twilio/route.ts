import { NextRequest, NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { normalizeTwilioPayload } from "@/lib/channels";
import { prisma } from "@/lib/db";
import { classifyAndExtract } from "@/lib/nlp";

export async function POST(req: NextRequest) {
  const orgId = getOrgId(req);
  const form = await req.formData();
  const entries = Object.fromEntries(form.entries());
  const msg = normalizeTwilioPayload(entries);

  // TODO: validate Twilio signature with TWILIO_AUTH_TOKEN

  const customer = await prisma.customer.upsert({
    where: { orgId_displayName: { orgId, displayName: msg.customerHandle || "unknown" } },
    update: {},
    create: { orgId, displayName: msg.customerHandle || "unknown" }
  });

  const thread = await prisma.messageThread.create({
    data: { orgId, customerId: customer.id, channel: msg.channel, externalThreadId: msg.externalThreadId }
  });
  const saved = await prisma.message.create({
    data: { threadId: thread.id, direction: "inbound", text: msg.text || "", attachments: msg.attachments ?? [] }
  });

  const nlu = await classifyAndExtract(msg.text || "");
  await prisma.message.update({ where: { id: saved.id }, data: { nlu } });

  return NextResponse.json({ ok: true, threadId: thread.id, messageId: saved.id, nlu });
}
