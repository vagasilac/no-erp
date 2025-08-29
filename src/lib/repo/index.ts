import { firebaseRepo } from './firestore';
import { prismaRepo } from './prisma';

export const repo = process.env.DATA_BACKEND === 'prisma' ? prismaRepo : firebaseRepo;
export type { Repo } from './contracts';
