import OpenAI from "openai";
import { NLUResult } from "@/lib/types";

console.log("DEBUG OPENAI KEY:", process.env.OPENAI_API_KEY?.slice(0, 10));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifyAndExtract(text: string): Promise<NLUResult> {
  const system = `You classify SME customer messages and extract entities.
Return strictly JSON with keys: intent, confidence, entities.
Allowed intents: ["place_order","change_order","cancel_order","invoice_sent","ask_status","new_product","other"].
Entities may include: product, qty, unit, due_date, customer_ref, price, currency, order_id.`;

  const resp = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: text }
    ]
  });

  const c = resp.output_text || "{}";
  try {
    const parsed = JSON.parse(c) as NLUResult;
    return parsed;
  } catch {
    return { intent: "other", confidence: 0.0, entities: {} };
  }
}

export function needsClarification(nlu: NLUResult): string[] {
  const missing: string[] = [];
  if (nlu.intent === "place_order") {
    if (!nlu.entities["product"]) missing.push("product");
    if (!nlu.entities["qty"]) missing.push("qty");
  }
  if (nlu.intent === "change_order") {
    if (!nlu.entities["order_id"]) missing.push("order_id");
  }
  return missing;
}

export function isOwnerSettingCommand(text: string) {
  return /^set\s+(lang|currency|units|approval)\b/i.test(text.trim());
}
