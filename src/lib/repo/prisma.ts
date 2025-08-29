import { prisma } from "@/lib/db";
import type { Repo, ID, ISODate } from "./contracts";

export const prismaRepo: Repo = {
  orders: {
    async create(orgId, data) {
      const created = await prisma.order.create({
        data: {
          orgId,
          status: data.status ?? "pending_confirm",
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          source: data.source ?? "chat",
          meta: data.meta ?? {},
          lines: data.lines ? { create: data.lines } : undefined,
        },
        select: { id: true },
      });
      return created.id;
    },
    async update(_orgId, id, patch) {
      await prisma.order.update({ where: { id }, data: patch });
    },
    async findById(_orgId, id) {
      const o = await prisma.order.findUnique({ where: { id } });
      return o ?? null;
    },
    async dueInRange(orgId, fromISO, toISO) {
      return prisma.order.findMany({
        where: { orgId, dueDate: { gte: new Date(fromISO), lte: new Date(toISO) } },
        orderBy: { dueDate: "asc" },
      });
    },
    async countOpen(orgId) {
      return prisma.order.count({
        where: { orgId, status: { in: ["pending_confirm", "confirmed", "in_production"] } },
      });
    },
  },

  products: {
    async findByName(orgId, name) {
      return prisma.product.findFirst({ where: { orgId, name } });
    },
    async upsertMany(orgId, list) {
      let n = 0;
      for (const item of list) {
        await prisma.product.upsert({
          where: { orgId_sku: { orgId, sku: item.sku } },
          update: { name: item.name, uom: item.uom || "pcs" },
          create: { orgId, sku: item.sku, name: item.name, uom: item.uom || "pcs" },
        });
        n++;
      }
      return n;
    },
    async list(orgId) {
      return prisma.product.findMany({ where: { orgId } });
    },
  },

  settings: {
    async get(orgId) {
      const s = await prisma.orgSettings.findUnique({ where: { orgId } });
      return s ?? {};
    },
    async set(orgId, patch) {
      await prisma.orgSettings.upsert({
        where: { orgId },
        update: patch as any,
        create: {
          orgId,
          primaryLang: "en",
          currency: "EUR",
          units: "pcs",
          requireApproval: true,
          ...(patch as any),
        },
      });
    },
  },

  threads: {
    async create(orgId, data) {
      const t = await prisma.messageThread.create({
        data: {
          orgId,
          customerId: data.customerId ?? null,
          channel: data.channel ?? "whatsapp",
          externalThreadId: data.externalThreadId ?? null,
          status: data.status ?? "open",
          meta: data.meta ?? {},
        },
        select: { id: true },
      });
      return t.id;
    },
    async addMessage(_orgId, threadId, msg) {
      const m = await prisma.message.create({
        data: {
          threadId,
          direction: msg.direction ?? "inbound",
          text: msg.text ?? "",
          attachments: msg.attachments ?? [],
          nlu: msg.nlu ?? null,
          action: msg.action ?? null,
        },
        select: { id: true },
      });
      return m.id;
    },
  },

  invoices: {
    async create(orgId, data) {
      const inv = await prisma.invoice.create({
        data: {
          orgId,
          number: String(data.number ?? "NA"),
          supplier: data.supplier ?? null,
          customer: data.customer ?? null,
          date: data.date ? new Date(data.date) : null,
          currency: data.currency ?? null,
          total: (data.total as any) ?? null,
          lines: data.lines ?? null,
        },
        select: { id: true },
      });
      return inv.id;
    },
  },

  inventory: {
    async move(orgId, data) {
      const mv = await prisma.inventoryMovement.create({
        data: {
          orgId,
          productId: data.productId,
          qtyChange: data.qtyChange,
          reason: data.reason ?? "manual_adj",
          relatedDoc: data.relatedDoc ?? null,
        },
        select: { id: true },
      });
      return mv.id;
    },
  },

  audit: {
    async log(orgId, entry) {
      await prisma.auditLog.create({
        data: {
          orgId,
          actor: entry.actor ?? "system",
          action: entry.action ?? "event",
          target: entry.target ?? null,
          details: entry.details ?? {},
        },
      });
    },
  },
};
