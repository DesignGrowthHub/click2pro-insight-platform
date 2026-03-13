import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const FALLBACK_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/click2pro_insight?schema=public";

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? FALLBACK_DATABASE_URL;
}

function getSchemaName(connectionString: string) {
  try {
    return new URL(connectionString).searchParams.get("schema") ?? undefined;
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = getDatabaseUrl();
const adapter = new PrismaPg(
  {
    connectionString
  },
  {
    schema: getSchemaName(connectionString),
  }
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
