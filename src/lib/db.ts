import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use a type-safe global variable that works in all environments
const globalForPrisma = typeof global !== "undefined" ? global : ({} as typeof global);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : [],
    // Disable prepared statements to avoid PostgreSQL connection pooling issues in development
    datasourceUrl: process.env.DATABASE_URL + (process.env.NODE_ENV === "development" ? "?pgbouncer=true&statement_cache_size=0" : ""),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

