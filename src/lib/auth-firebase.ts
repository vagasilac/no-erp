import { NextRequest } from 'next/server';
import admin from './firebase-admin';

export async function getOrgIdFromAuth(req: NextRequest) {
  const header = req.headers.get('authorization');
  const token = header?.replace('Bearer ', '').trim();
  if (!token) return process.env.DEFAULT_ORG_ID || 'dev-org';
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return (decoded as any).orgId || process.env.DEFAULT_ORG_ID || 'dev-org';
  } catch {
    return process.env.DEFAULT_ORG_ID || 'dev-org';
  }
}
