import { PrismaClient } from "@prisma/client";

let globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__vaMarketplacePrisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__vaMarketplacePrisma = prisma;
}

