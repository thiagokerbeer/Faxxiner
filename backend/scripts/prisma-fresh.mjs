/**
 * Apaga `node_modules/.prisma` e roda `prisma generate`.
 * Ajuda quando o Windows/OneDrive bloqueia rename do engine (EPERM) durante `prisma generate`.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const prismaDir = join(root, "node_modules", ".prisma");

if (existsSync(prismaDir)) {
  rmSync(prismaDir, { recursive: true, force: true });
  console.log("[prisma-fresh] Removido node_modules/.prisma");
}

execSync("npx prisma generate", { cwd: root, stdio: "inherit", shell: true });
