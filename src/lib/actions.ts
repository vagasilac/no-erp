import { prisma } from "@/lib/db";
import { NLUResult } from "@/lib/types";

export async function executeNLU(orgId: string, nlu: NLUResult) {
  switch (nlu.intent) {
    case "place_order":
      return createOrderFromEntities(orgId, nlu.entities);
    case "change_order":
      return updateOrderFromEntities(orgId, nlu.entities);
    case "invoice_sent":
      return createInvoiceFromEntities(orgId, nlu.entities);
    case "ask_status":
      return getStatusFromEntities(orgId, nlu.entities);
    default:
      return { ok: false, message: "Unsupported intent or needs clarification." };
  }
}

export async function applyOwnerSetting(orgId: string, raw: string) {
  const t = raw.trim();
  const s = await prisma.orgSettings.findUnique({ where: { orgId } });
  if (!s) throw new Error("Settings not found");

  const m = t.match(/^set\s+(lang|currency|units|approval)\s+(.+)$/i);
  if (!m) return { ok: false, message: "Unknown settings command" };
  const key = m[1].toLowerCase();
  const val = m[2].trim();

  switch (key) {
    case "lang": {
      const [p, sec] = val.split(/[,\s]+/);
      await prisma.orgSettings.update({ where: { orgId }, data: { primaryLang: p.toLowerCase(), secondaryLang: sec?.toLowerCase() || null } });
      return { ok: true, message: `Languages set to ${val}` };
    }
    case "currency": {
      await prisma.orgSettings.update({ where: { orgId }, data: { currency: val.toUpperCase() } });
      return { ok: true, message: `Currency set to ${val}` };
    }
    case "units": {
      await prisma.orgSettings.update({ where: { orgId }, data: { units: val.toLowerCase() } });
      return { ok: true, message: `Units set to ${val}` };
    }
    case "approval": {
      const on = /^(on|true|yes)$/i.test(val);
      await prisma.orgSettings.update({ where: { orgId }, data: { requireApproval: on } });
      return { ok: true, message: `Approval requirement ${on ? "enabled" : "disabled"}` };
    }
  }
  return { ok: false, message: "Unknown settings command" };
}

async function createOrderFromEntities(orgId: string, e: Record<string, any>) {
  const productName = String(e.product ?? "").trim();
  const qty = Number(e.qty ?? 0);
  if (!productName || !qty) return { ok: false, message: "Missing product or qty" };

  const product = await prisma.product.findFirst({ where: { orgId, name: productName } });
  if (!product) return { ok: false, message: `Unknown product: ${productName}` };

  const order = await prisma.order.create({
    data: {
      orgId,
      status: "pending_confirm",
      dueDate: e.due_date ? new Date(e.due_date) : null,
      source: "chat",
      lines: { create: [{ productId: product.id, qty }] }
    },
    include: { lines: true }
  });

  return { ok: true, message: `Order ${order.id} created`, effects: { order } };
}

async function updateOrderFromEntities(orgId: string, e: Record<string, any>) {
  const orderId = String(e.order_id ?? "");
  if (!orderId) return { ok: false, message: "Missing order_id" };
  const order = await prisma.order.findFirst({ where: { orgId, id: orderId }, include: { lines: true } });
  if (!order) return { ok: false, message: "Order not found" };

  if (e.status) {
    const status = String(e.status);
    await prisma.order.update({ where: { id: order.id }, data: { status } });
  }
  if (e.qty && e.product) {
    const product = await prisma.product.findFirst({ where: { orgId, name: String(e.product) } });
    if (product) {
      const line = order.lines.find(l => l.productId === product.id);
      if (line) await prisma.orderLine.update({ where: { id: line.id }, data: { qty: Number(e.qty) } });
    }
  }

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { lines: true } });
  return { ok: true, message: `Order ${order.id} updated`, effects: { order: updated } };
}

async function createInvoiceFromEntities(orgId: string, e: Record<string, any>) {
  const invoice = await prisma.invoice.create({
    data: {
      orgId,
      number: String(e.number ?? "NA"),
      supplier: e.supplier ? String(e.supplier) : null,
      customer: e.customer ? String(e.customer) : null,
      date: e.date ? new Date(e.date) : null,
      currency: e.currency ? String(e.currency) : null,
      total: e.total ? e.total : null,
      lines: e.lines ?? null
    }
  });
  return { ok: true, message: `Invoice ${invoice.number} stored`, effects: { invoice } };
}

async function getStatusFromEntities(orgId: string, e: Record<string, any>) {
  if (e.order_id) {
    const order = await prisma.order.findFirst({ where: { orgId, id: String(e.order_id) } });
    if (!order) return { ok: false, message: "Order not found" };
    return { ok: true, message: `Order ${order.id} is ${order.status}` };
  }
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const orders = await prisma.order.findMany({
    where: { orgId, dueDate: { gte: now, lte: in7 } },
    include: { lines: { include: { product: true } } }
  });
  return { ok: true, message: `${orders.length} orders due within 7 days.`, effects: { orders } };
}
