import type { Request, Response, NextFunction } from "express";
import { isProduction } from "../lib/env.js";
import { logError } from "../lib/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logError("unhandled", err);
  if (res.headersSent) return;
  res.status(500).json({
    error: isProduction() ? "Erro interno" : err instanceof Error ? err.message : "Erro interno",
  });
}
