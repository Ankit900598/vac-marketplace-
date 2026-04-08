import "dotenv/config";
import { prisma } from "@va-marketplace/db";

const apps = await prisma.vaApplication.findMany({
  select: {
    id: true,
    status: true,
    testScore: true,
    createdAt: true,
    vaProfile: { select: { id: true, user: { select: { email: true } } } },
  },
  orderBy: { createdAt: "desc" },
});

console.log(apps);
await prisma.$disconnect();

