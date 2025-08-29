import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get("content-type") || "audio/webm";
  const buf = Buffer.from(await req.arrayBuffer());
  const blob = new Blob([buf], { type: contentType });
  const resp = await client.audio.transcriptions.create({
    model: "whisper-1",
    file: blob as any,
  });
  return NextResponse.json({ ok: true, text: resp.text });
}
