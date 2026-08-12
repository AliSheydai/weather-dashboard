// This file is used by Prisma CLI for migrations and schema operations.
// - DIRECT_URL (port 5432): used here for migrations — requires a direct connection
//   because Transaction Pooler (port 6543 / pgBouncer) does not support advisory locks
//   that Prisma Migrate needs, causing it to hang indefinitely.
// - DATABASE_URL (port 6543): used by the app at runtime via PrismaClient for queries.
import "dotenv/config";
import { defineConfig } from "prisma/config";

// For migrations, always use the direct connection URL (DIRECT_URL).
// Fall back to DATABASE_URL only if DIRECT_URL is not set.
const migrationUrl =
  process.env["DIRECT_URL"] || process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
