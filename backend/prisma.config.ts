import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Com prisma.config.ts o CLI não carrega .env sozinho; carregamos explicitamente.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "prisma", ".env") });

/** Só em CI (GitHub Actions / outros) quando não há .env nem secret — URL fictícia para validate/generate. */
const CI_FALLBACK =
  "postgresql://ci:ci@127.0.0.1:5432/ci?schema=public";

if (
  !process.env.DATABASE_URL &&
  (process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true")
) {
  process.env.DATABASE_URL = CI_FALLBACK;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
