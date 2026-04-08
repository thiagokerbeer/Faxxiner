import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logAccess } from "../lib/logger.js";

const MAX_RID_LEN = 128;

/**
 * Propaga ou gera X-Request-Id e registra método/path/status/duração (JSON em produção).
 */
export const requestContextMiddleware: RequestHandler = (req, res, next) => {
  const raw = req.headers["x-request-id"];
  const requestId =
    typeof raw === "string" && raw.length > 0 && raw.length <= MAX_RID_LEN
      ? raw.trim()
      : randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    logAccess({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
};
