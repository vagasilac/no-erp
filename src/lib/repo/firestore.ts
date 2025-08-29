import { db } from '../firebase-admin';
import { Repo } from './contracts';

function orgCol(orgId: string, col: string) {
  return db.collection('orgs').doc(orgId).collection(col);
}

export const firebaseRepo: Repo = {
  orders: {
    async create(orgId, data) {
      const ref = await orgCol(orgId, 'orders').add({ ...data, createdAt: new Date() });
      return ref.id;
    },
    async update(orgId, id, patch) {
      await orgCol(orgId, 'orders').doc(id).set(patch, { merge: true });
    },
    async dueInRange(orgId, fromISO, toISO) {
      const snap = await orgCol(orgId, 'orders')
        .where('dueDate', '>=', new Date(fromISO))
        .where('dueDate', '<=', new Date(toISO))
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async findById(orgId, id) {
      const doc = await orgCol(orgId, 'orders').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
  },
  products: {
    async findByName(orgId, name) {
      const snap = await orgCol(orgId, 'products').where('name', '==', name).limit(1).get();
      const d = snap.docs[0];
      return d ? { id: d.id, ...d.data() } : null;
    },
    async upsertMany(orgId, list) {
      for (const p of list) {
        await orgCol(orgId, 'products').doc(p.id || p.sku || p.name).set(p, { merge: true });
      }
      return list.length;
    },
    async list(orgId) {
      const snap = await orgCol(orgId, 'products').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },
  customers: {
    async upsertByDisplayName(orgId, displayName) {
      const ref = orgCol(orgId, 'customers').doc(displayName);
      await ref.set({ displayName }, { merge: true });
      const doc = await ref.get();
      return { id: doc.id, ...doc.data() };
    }
  },
  settings: {
    async get(orgId) {
      const doc = await orgCol(orgId, 'config').doc('settings').get();
      return doc.exists ? doc.data() : {};
    },
    async set(orgId, patch) {
      await orgCol(orgId, 'config').doc('settings').set(patch, { merge: true });
    }
  },
  threads: {
    async create(orgId, data) {
      const ref = await orgCol(orgId, 'threads').add({ ...data, createdAt: new Date() });
      return ref.id;
    },
    async addMessage(orgId, threadId, msg) {
      const ref = await orgCol(orgId, 'threads').doc(threadId).collection('messages').add({ ...msg, createdAt: new Date() });
      return ref.id;
    },
    async delete(orgId, threadId) {
      const msgSnap = await orgCol(orgId, 'threads').doc(threadId).collection('messages').get();
      for (const m of msgSnap.docs) await m.ref.delete();
      await orgCol(orgId, 'threads').doc(threadId).delete();
    },
    async export(orgId, threadId) {
      const threadDoc = await orgCol(orgId, 'threads').doc(threadId).get();
      if (!threadDoc.exists) return null;
      const msgs = await orgCol(orgId, 'threads').doc(threadId).collection('messages').orderBy('createdAt').get();
      return {
        thread: { id: threadDoc.id, ...threadDoc.data() },
        messages: msgs.docs.map(d => ({ id: d.id, ...d.data() }))
      };
    }
  },
  invoices: {
    async create(orgId, data) {
      const ref = await orgCol(orgId, 'invoices').add({ ...data, createdAt: new Date() });
      return ref.id;
    }
  },
  inventory: {
    async move(orgId, data) {
      const ref = await orgCol(orgId, 'inventory').add({ ...data, createdAt: new Date() });
      return ref.id;
    }
  },
  audit: {
    async log(orgId, entry) {
      await orgCol(orgId, 'audit').add({ ...entry, createdAt: new Date() });
    }
  }
};
