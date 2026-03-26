import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Optimize connection pool for Supabase pooler
    ...(process.env.DATABASE_URL?.includes("pooler") && {
      // Reduce pool size for Supabase pooler (Session mode has lower limits)
      __internal: {
        engine: {
          binaryPath: undefined,
        },
      },
    }),
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
