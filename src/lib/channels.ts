export type NormalizedMessage = {
  channel: string; // whatsapp, email, web
  externalThreadId?: string;
  customerHandle?: string; // phone/email
  text?: string;
  attachments?: { url: string; mime?: string }[];
};

export function normalizeTwilioPayload(body: any): NormalizedMessage {
  const mediaCount = Number(body.NumMedia || 0);
  const attachments = Array.from({ length: mediaCount }).map((_, i) => ({
    url: body[`MediaUrl${i}`],
    mime: body[`MediaContentType${i}`]
  }));
  return {
    channel: "whatsapp",
    externalThreadId: body.From,
    customerHandle: body.From,
    text: body.Body,
    attachments
  };
}
