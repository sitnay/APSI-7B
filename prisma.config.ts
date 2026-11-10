import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

const databaseUrl = env("DATABASE_URL");
let parsedDatabaseUrl: URL;
try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  throw new Error("DATABASE_URL bukan URL PostgreSQL yang valid.");
}
const sslmode = parsedDatabaseUrl.searchParams.get("sslmode")?.toLowerCase();

if (
  !["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol) ||
  !parsedDatabaseUrl.hostname.endsWith(".neon.tech") ||
  (parsedDatabaseUrl.port && parsedDatabaseUrl.port !== "5432") ||
  !parsedDatabaseUrl.username ||
  !parsedDatabaseUrl.password ||
  !parsedDatabaseUrl.pathname.slice(1) ||
  !["require", "verify-ca", "verify-full"].includes(sslmode ?? "")
) {
  throw new Error("DATABASE_URL harus menunjuk ke database Neon PostgreSQL dengan SSL aktif.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
