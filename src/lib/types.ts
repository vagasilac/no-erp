export type OrgContext = { orgId: string };

export type Intent =
  | "place_order"
  | "change_order"
  | "cancel_order"
  | "invoice_sent"
  | "ask_status"
  | "new_product"
  | "other";

export type NLUResult = {
  intent: Intent;
  confidence: number;
  entities: Record<string, unknown>;
};

export type CommandResult = {
  ok: boolean;
  message: string;
  effects?: Record<string, unknown>;
};
