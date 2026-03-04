import { PrismaClient } from "@prisma/client";

// Next.js の HMR で new PrismaClient() が何度も走り接続が枯渇する問題を防ぐ
// 参考: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
