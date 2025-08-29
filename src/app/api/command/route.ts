import { NextRequest, NextResponse } from "next/server";
import { getOrgIdFromAuth } from "@/lib/auth-firebase";
import { classifyAndExtract, needsClarification, isOwnerSettingCommand } from "@/lib/nlp";
import { executeNLU, applyOwnerSetting } from "@/lib/actions";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const orgId = await getOrgIdFromAuth(req);
  const { text } = await req.json();
  if (!text) return NextResponse.json({ ok: false, message: "No text provided" }, { status: 400 });

  if (isOwnerSettingCommand(text)) {
    const res = await applyOwnerSetting(orgId, text);
    return NextResponse.json(res);
  }

  const nlu = await classifyAndExtract(text);
  const missing = needsClarification(nlu);
  if (nlu.confidence < 0.75 || missing.length) {
    const msg = `I understood intent: ${nlu.intent}. Missing: ${missing.join(", ") || "context"}.`;
    await audit(orgId, "system", "clarify_needed", undefined, { text, nlu, missing });
    return NextResponse.json({ ok: false, message: msg, effects: { nlu } });
  }

  const res = await executeNLU(orgId, nlu);
  await audit(orgId, "system", "command_executed", undefined, { text, nlu, res });
  return NextResponse.json(res);
}
