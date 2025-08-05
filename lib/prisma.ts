import { PrismaClient } from "../app/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch (error) {
  console.error("Failed to initialize PrismaClient:", error);
  throw error;
}

export default prisma;
