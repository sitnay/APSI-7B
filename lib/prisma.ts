import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getNeonConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL belum disetel. Tambahkan URL Neon ke .env.local.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL bukan URL PostgreSQL yang valid.");
  }

  const sslmode = url.searchParams.get("sslmode")?.toLowerCase();
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech") ||
    (url.port && url.port !== "5432") ||
    !url.username ||
    !url.password ||
    !url.pathname.slice(1) ||
    !["require", "verify-ca", "verify-full"].includes(sslmode ?? "")
  ) {
    throw new Error("DATABASE_URL harus menunjuk ke database Neon PostgreSQL dengan SSL aktif.");
  }

  return connectionString;
}

const adapter = new PrismaPg({ connectionString: getNeonConnectionString() });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
