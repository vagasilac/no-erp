import { prisma } from '../db';
import { Repo } from './contracts';

export const prismaRepo: Repo = {
  orders: {
    async create(orgId, data) {
      const o = await prisma.order.create({ data: { ...data, orgId } });
      return o.id;
    },
    async update(orgId, id, patch) {
      await prisma.order.update({ where: { id }, data: patch });
    },
    async dueInRange(orgId, fromISO, toISO) {
      return prisma.order.findMany({ where: { orgId, dueDate: { gte: new Date(fromISO), lte: new Date(toISO) } } });
    },
    async findById(orgId, id) {
      return prisma.order.findFirst({ where: { orgId, id } });
    }
  },
  products: {
    async findByName(orgId, name) {
      return prisma.product.findFirst({ where: { orgId, name } });
    },
    async upsertMany(orgId, list) {
      for (const p of list) {
        await prisma.product.upsert({
          where: { orgId_sku: { orgId, sku: p.sku } },
          create: { ...p, orgId },
          update: p
        });
      }
      return list.length;
    },
    async list(orgId) {
      return prisma.product.findMany({ where: { orgId } });
    }
  },
  customers: {
    async upsertByDisplayName(orgId, displayName) {
      return prisma.customer.upsert({
        where: { orgId_displayName: { orgId, displayName } },
        update: {},
        create: { orgId, displayName }
      });
    }
  },
  settings: {
    async get(orgId) {
      return prisma.orgSettings.findUnique({ where: { orgId } });
    },
    async set(orgId, patch) {
      await prisma.orgSettings.upsert({
        where: { orgId },
        create: { orgId, ...patch },
        update: patch
      });
    }
  },
  threads: {
    async create(orgId, data) {
      const t = await prisma.messageThread.create({ data: { ...data, orgId } });
      return t.id;
    },
    async addMessage(orgId, threadId, msg) {
      const m = await prisma.message.create({ data: { ...msg, threadId } });
      return m.id;
    },
    async delete(orgId, threadId) {
      await prisma.message.deleteMany({ where: { threadId } });
      await prisma.messageThread.delete({ where: { id: threadId } });
    },
    async export(orgId, threadId) {
      const thread = await prisma.messageThread.findFirst({ where: { orgId, id: threadId } });
      if (!thread) return null;
      const messages = await prisma.message.findMany({ where: { threadId }, orderBy: { createdAt: 'asc' } });
      return { thread, messages };
    }
  },
  invoices: {
    async create(orgId, data) {
      const inv = await prisma.invoice.create({ data: { ...data, orgId } });
      return inv.id;
    }
  },
  inventory: {
    async move(orgId, data) {
      const mv = await prisma.inventoryMovement.create({ data: { ...data, orgId } });
      return mv.id;
    }
  },
  audit: {
    async log(orgId, entry) {
      await prisma.auditLog.create({ data: { orgId, ...entry } });
    }
  }
};
