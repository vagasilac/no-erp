import { firebaseRepo } from "./firestore";
import { prismaRepo } from "./prisma";
import type { Repo } from "./contracts";

export const repo: Repo =
  process.env.DATA_BACKEND === "prisma" ? prismaRepo : firebaseRepo;
