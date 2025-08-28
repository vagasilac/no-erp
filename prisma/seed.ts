import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.org.upsert({
    where: { id: "dev-org" },
    update: {},
    create: { id: "dev-org", name: "Dev Org" },
  });

  await prisma.orgSettings.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      primaryLang: "en",
      secondaryLang: "hu",
      currency: "EUR",
      units: "pcs",
      requireApproval: true,
    },
  });

  await prisma.product.upsert({
    where: { orgId_sku: { orgId: org.id, sku: "NORDIC-CHAIR" } },
    update: {},
    create: { orgId: org.id, sku: "NORDIC-CHAIR", name: "Nordic Chair", uom: "pcs" },
  });

  console.log("Seed complete");
}

main().finally(() => prisma.$disconnect());
