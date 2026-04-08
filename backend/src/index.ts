import "dotenv/config";
import { assertEnvAtStartup } from "./lib/env.js";
import { createApp } from "./app.js";
import { disconnectPrisma } from "./lib/prisma.js";

assertEnvAtStartup();

const port = Number(process.env.PORT) || 4002;
const app = createApp();

const server = app.listen(port);

server.once("listening", () => {
  console.log(`Faxxiner API http://localhost:${port}`);
});

function shutdown(signal: string): void {
  console.log(`[faxxiner] ${signal}, encerrando…`);
  server.close((closeErr) => {
    if (closeErr) {
      console.error(closeErr);
    }
    void disconnectPrisma().finally(() => process.exit(closeErr ? 1 : 0));
  });
  setTimeout(() => {
    void disconnectPrisma().finally(() => process.exit(1));
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[faxxiner] Porta ${port} já está em uso — outro backend (ou app) está usando essa porta. ` +
        `Se você já tem um terminal com npm run dev, use só esse; senão encerre o processo ou use outra PORT no .env e o mesmo valor no proxy do Vite.`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
