import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prismaClient = process.env.DATABASE_URL
  ? new PrismaClient({
      log: ["query", "error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  : null;

export const prisma: PrismaClient | null =
  process.env.NODE_ENV !== "production"
    ? globalForPrisma.prisma || prismaClient
    : prismaClient;

if (process.env.NODE_ENV !== "production" && prismaClient) {
  globalForPrisma.prisma = prismaClient;
}

export function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Prisma is not configured because DATABASE_URL is not defined");
  }
  return prisma;
}
