import type { Repo } from "./contracts";

let selected: Repo;
if (process.env.DATA_BACKEND === "prisma") {
  const { prismaRepo } = await import("./prisma");
  selected = prismaRepo;
} else {
  const { firebaseRepo } = await import("./firestore");
  selected = firebaseRepo;
}

export const repo: Repo = selected;
