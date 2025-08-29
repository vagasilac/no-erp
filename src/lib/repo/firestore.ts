import { db } from "@/lib/firebase-admin";
import type { Repo, ID, ISODate } from "./contracts";

function coll(orgId: ID, name: string) {
  return db.collection("orgs").doc(orgId).collection(name);
}

export const firebaseRepo: Repo = {
  orders: {
    async create(orgId, data) {
      const ref = coll(orgId, "orders").doc();
      await ref.set({ ...data, createdAt: Date.now() });
      return ref.id;
    },
    async update(orgId, id, patch) {
      await coll(orgId, "orders").doc(id).update(patch);
    },
    async findById(orgId, id) {
      const snap = await coll(orgId, "orders").doc(id).get();
      return snap.exists ? { id: snap.id, ...snap.data() } : null;
    },
    async dueInRange(orgId, fromISO, toISO) {
      const q = await coll(orgId, "orders")
        .where("dueDate", ">=", fromISO)
        .where("dueDate", "<=", toISO)
        .get();
      return q.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async countOpen(orgId) {
      const q = await coll(orgId, "orders")
        .where("status", "in", ["pending_confirm", "confirmed", "in_production"])
        .get();
      return q.size;
    },
  },

  products: {
    async findByName(orgId, name) {
      const q = await coll(orgId, "products").where("name", "==", name).limit(1).get();
      return q.empty ? null : { id: q.docs[0].id, ...q.docs[0].data() };
    },
    async upsertMany(orgId, list) {
      const batch = db.batch();
      list.forEach(item => {
        const ref = coll(orgId, "products").doc(item.sku);
        batch.set(
          ref,
          { sku: item.sku, name: item.name, uom: item.uom || "pcs", updatedAt: Date.now() },
          { merge: true }
        );
      });
      await batch.commit();
      return list.length;
    },
    async list(orgId) {
      const snap = await coll(orgId, "products").get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  },

  settings: {
    async get(orgId) {
      const ref = coll(orgId, "settings").doc("default");
      const snap = await ref.get();
      return snap.exists ? snap.data() : {};
    },
    async set(orgId, patch) {
      const ref = coll(orgId, "settings").doc("default");
      await ref.set({ ...patch, updatedAt: Date.now() }, { merge: true });
    },
  },

  threads: {
    async create(orgId, data) {
      const ref = coll(orgId, "threads").doc();
      await ref.set({ ...data, createdAt: Date.now() });
      return ref.id;
    },
    async addMessage(orgId, threadId, msg) {
      const ref = coll(orgId, "threads").doc(threadId).collection("messages").doc();
      await ref.set({ ...msg, createdAt: Date.now() });
      return ref.id;
    },
  },

  invoices: {
    async create(orgId, data) {
      const ref = coll(orgId, "invoices").doc();
      await ref.set({ ...data, createdAt: Date.now() });
      return ref.id;
    },
  },

  inventory: {
    async move(orgId, data) {
      const ref = coll(orgId, "inventoryMoves").doc();
      await ref.set({ ...data, createdAt: Date.now() });
      return ref.id;
    },
  },

  audit: {
    async log(orgId, entry) {
      await coll(orgId, "audit").doc().set({ ...entry, createdAt: Date.now() });
    },
  },
};
