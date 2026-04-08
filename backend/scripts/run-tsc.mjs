import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(backendRoot, "tsconfig.build.json");
const tsc = path.join(backendRoot, "node_modules", "typescript", "bin", "tsc");

if (!fs.existsSync(configPath)) {
  console.error(
    `TS5058: missing ${configPath}\n` +
      `cwd=${process.cwd()}\n` +
      "Commit backend/tsconfig.build.json or fix the CI working directory (backend/).",
  );
  process.exit(1);
}

const r = spawnSync(process.execPath, [tsc, "-p", configPath], {
  cwd: backendRoot,
  stdio: "inherit",
  env: process.env,
});

process.exit(r.status === null ? 1 : r.status);
