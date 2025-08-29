import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseInvoiceFromImage } from "@/lib/ocr";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const buf = Buffer.from(await req.arrayBuffer());
  const parsed = await parseInvoiceFromImage(buf);
  return NextResponse.json({ ok: true, parsed });
}
