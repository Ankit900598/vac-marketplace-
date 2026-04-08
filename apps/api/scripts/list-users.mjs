import "dotenv/config";
import { prisma } from "@va-marketplace/db";

const users = await prisma.user.findMany({
  select: { email: true, role: true, createdAt: true },
  orderBy: { createdAt: "asc" },
});

console.log(users);
await prisma.$disconnect();

