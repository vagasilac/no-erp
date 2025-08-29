import { repo } from "./repo";

export async function audit(orgId: string, actor: string, action: string, target?: string, details?: any) {
  await repo.audit.log(orgId, { actor, action, target, details });
}
