import type { NextRequest } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function getOrgIdFromAuth(req: NextRequest): Promise<string> {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return process.env.DEFAULT_ORG_ID || "dev-org";
    const decoded = await auth.verifyIdToken(token);
    const orgId = (decoded as any).orgId as string | undefined;
    return orgId || process.env.DEFAULT_ORG_ID || "dev-org";
  } catch {
    return process.env.DEFAULT_ORG_ID || "dev-org";
  }
}
