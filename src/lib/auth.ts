import { NextRequest } from "next/server";

export function getOrgId(req: NextRequest): string {
  const h = req.headers.get("x-org-id");
  if (h) return h;
  return process.env.DEFAULT_ORG_ID || "dev-org";
}
