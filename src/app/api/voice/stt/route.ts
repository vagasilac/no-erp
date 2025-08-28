import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const _buf = Buffer.from(await req.arrayBuffer());
  // TODO: call Whisper/Deepgram; return { text }
  return NextResponse.json({ ok: true, text: "(stub) recognized speech" });
}
