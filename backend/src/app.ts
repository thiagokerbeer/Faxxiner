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

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(globalApiLimiter);

  const origins =
    process.env.FRONTEND_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) ?? ["http://localhost:5173"];

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
