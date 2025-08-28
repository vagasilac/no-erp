import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrgId } from "@/lib/auth";
import { classifyAndExtract } from "@/lib/nlp";

export async function POST(req: NextRequest) {
  const orgId = getOrgId(req);
  const body = await req.json();
  const { from, subject, text, threadKey } = body;

  const customer = await prisma.customer.upsert({
    where: { orgId_displayName: { orgId, displayName: from } },
    update: {},
    create: { orgId, displayName: from }
  });

  const thread = await prisma.messageThread.create({
    data: { orgId, customerId: customer.id, channel: "email", externalThreadId: threadKey || from }
  });
  const saved = await prisma.message.create({
    data: { threadId: thread.id, direction: "inbound", text: `${subject}\n${text}` }
  });

  const nlu = await classifyAndExtract(`${subject}\n${text}`);
  await prisma.message.update({ where: { id: saved.id }, data: { nlu } });
  return NextResponse.json({ ok: true, threadId: thread.id, messageId: saved.id, nlu });
}
