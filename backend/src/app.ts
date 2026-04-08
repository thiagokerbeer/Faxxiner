import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { diaristasRouter } from "./routes/diaristas.js";
import { bookingsRouter } from "./routes/bookings.js";
import { adminRouter } from "./routes/admin.js";
import { legalRouter } from "./routes/legal.js";
import { meRouter } from "./routes/me.js";
import { globalApiLimiter } from "./middleware/rateLimits.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import { getFrontendCorsOrigins, isProduction } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { asyncHandler } from "./lib/asyncHandler.js";

export function createApp() {
  const app = express();

  if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(requestContextMiddleware);

  /** Só status (sem corpo) — útil para alguns monitores de uptime. */
  app.head("/health", (_req, res) => {
    res.status(200).end();
  });

  app.get(
    "/health",
    asyncHandler(async (req, res) => {
      if (req.query.deep === "1") {
        if (isProduction()) {
          const secret = process.env.HEALTH_DEEP_SECRET?.trim();
          if (!secret || secret.length < 16) {
            res.status(403).json({ error: "Indisponível" });
            return;
          }
          const hdr = req.headers["x-health-deep-key"];
          const keyFromHeader = typeof hdr === "string" ? hdr : Array.isArray(hdr) ? hdr[0] : "";
          const qk = req.query.key;
          const keyFromQuery = typeof qk === "string" ? qk : "";
          if (keyFromHeader !== secret && keyFromQuery !== secret) {
            res.status(403).json({ error: "Indisponível" });
            return;
          }
        }
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, db: true });
        return;
      }
      res.json({ ok: true });
    })
  );

  /** Raiz — só para quem abre a URL da API no navegador (não é o site; o front fica na Vercel). */
  app.get("/", (_req, res) => {
    res.json({
      service: "Faxxiner API",
      ok: true,
      health: "/health",
      hint: "O app web usa rotas em /api/*; a interface fica no domínio do frontend (ex. Vercel).",
    });
  });

  app.use(globalApiLimiter);

  const origins = getFrontendCorsOrigins();

  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "256kb" }));

  app.use("/api/legal", legalRouter);
  app.use("/api/me", meRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/diaristas", diaristasRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => res.status(404).json({ error: "Não encontrado" }));

  app.use(errorHandler);

  return app;
}
