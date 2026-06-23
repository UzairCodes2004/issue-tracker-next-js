import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;