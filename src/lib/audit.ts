import { prisma } from "@/lib/db";

export async function audit(orgId: string, actor: string, action: string, target?: string, details?: any) {
  await prisma.auditLog.create({
    data: { orgId, actor, action, target, details }
  });
}
