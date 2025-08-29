# Conversational Micro‑ERP (MVP)

A chat‑first, document‑aware micro‑ERP starter built with Next.js App Router. The data layer is switchable between Firebase (Firestore) and Postgres/Prisma via a repo adapter.

## Features
- WhatsApp & Email **ingress** (webhooks) → normalize → NLU → actions
- Chat command panel → **safe, whitelisted** actions (no free‑form SQL)
- Dashboard & tables (orders + KPIs)
- **Settings via WhatsApp** (languages, currency, units, approval policy)
- Public **micro‑site** per org: `/{org}/catalog` and `/{org}/order`
- Invoice OCR via Google Document AI (EU)
- **Voice (STT)** stub endpoint
- **Auth**: NextAuth (Email magic link)
- Multi‑tenant ready (orgId everywhere) + audit log

## Architecture

```
[WhatsApp/Email] -> Webhooks -> NLU -> Actions -> Repo -> (Firestore|Prisma)
                                              ^
                                              |
                                  ChatPanel / Dashboard
```

## Quickstart
1. Copy `.env.example` → `.env` and fill values.
2. Install deps
   ```bash
   npm i
   ```
3. Choose backend via `DATA_BACKEND`.

### Firebase mode (default)
```
DATA_BACKEND=firebase
npm run dev
```
Requires service account vars and EU region (`europe-west1`).

### Prisma/Postgres mode
```
DATA_BACKEND=prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

5. Open http://localhost:3000 and try in the Chat:
```
add order 12 pcs Nordic Chair for Friday
```

## Invoice OCR (Document AI)
1. Enable the Document AI API.
2. Create an **Invoice Parser** processor in the EU (`DOCAI_LOCATION=eu`) and note its processor ID.
3. Set `DOCAI_LOCATION` and `DOCAI_INVOICE_PROCESSOR_ID` in `.env`.
4. Use an EU Firebase Storage bucket.
5. Deploy the function:
   ```bash
   npm --prefix functions run build
   firebase deploy --only functions
   ```
6. Upload invoices to `orgs/{orgId}/inbox/` to trigger parsing; results go to `orgs/{orgId}/invoices/{docId}` and files move to `/processed/`.

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
POST `speech/webm` or `audio/mpeg` to `/api/voice/stt` → returns `{ "text": "..." }` and forward to `/api/command`.

## GDPR & EU residency
- EU regions by default (`europe-west1`/`eur3`).
- Storage paths: `orgs/{orgId}/...`.
- `/api/gdpr/delete-thread` and `/api/gdpr/export-thread` allow owner-initiated deletion/export.
- Prefer EU-friendly WA providers (MessageBird/Infobip). Twilio optional with consent.

### Cost note
Firestore charges per document read; aggregate/cache where possible.

## Notes
- This is an MVP scaffold. Replace stubs (OCR, STT) with production providers.
- Keep actions **whitelisted** in `src/lib/actions.ts` to avoid LLM overreach.

MIT © 2025
