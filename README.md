# Conversational Micro‑ERP (MVP)

A chat‑first, document‑aware micro‑ERP starter built with Next.js App Router + Prisma.

## Features
- WhatsApp & Email **ingress** (webhooks) → normalize → NLU → actions
- Chat command panel → **safe, whitelisted** actions (no free‑form SQL)
- Dashboard & tables (orders + KPIs)
- **Settings via WhatsApp** (languages, currency, units, approval policy)
- Public **micro‑site** per org: `/{org}/catalog` and `/{org}/order`
- Invoice OCR **stub** (wire Azure FR/Rossum later)
- **Voice (STT)** stub endpoint
- **Auth**: NextAuth (Email magic link)
- Multi‑tenant ready (orgId everywhere) + audit log

## Quickstart
1. Copy `.env.example` → `.env` and fill values (DB, OpenAI, Email).
2. Install deps
   ```bash
   npm i
   ```
3. Prisma
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Dev server
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 and try in the Chat:
   ```
   add order 12 pcs Nordic Chair for Friday
   ```

## WhatsApp Owner Settings (via Chat)
- `SET LANG en,hu`
- `SET CURRENCY EUR`
- `SET UNITS pcs`
- `SET APPROVAL on|off`

## Email Inbound (via n8n)
Use IMAP node → Function to build JSON:
```json
{{"from": $json["from"], "subject": $json["subject"], "text": $json["text"], "threadKey": $json["messageId"]}}
```
→ HTTP Request (POST) to `/api/webhooks/email` with `x-org-id` header.

## Voice (STT)
POST audio/webm or mp3 to `/api/voice/stt` → returns `{"text": "..."}`. Then forward to `/api/command`.

## GDPR & EU residency
- Use EU DB/storage providers (Neon/Aiven, Wasabi EU/Scaleway).
- Prefer EU-friendly WA providers (MessageBird/Infobip). Twilio optional with consent.
- Add DPA and retention/deletion endpoints for threads and attachments.

## Notes
- This is an MVP scaffold. Replace stubs (OCR, STT) with production providers.
- Keep actions **whitelisted** in `src/lib/actions.ts` to avoid LLM overreach.

MIT © 2025
