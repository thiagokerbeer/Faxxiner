import type { Request, Response, NextFunction } from "express";
import { getFrontendCorsOrigins, isProduction } from "../lib/env.js";

/**
 * Em produção, rotas que dependem de cookie (CSRF parcial) exigem cabeçalho Origin
 * alinhado ao CORS do frontend.
 */
export function requireSpaOriginForCookieRoutes(req: Request, res: Response, next: NextFunction): void {
  if (!isProduction()) {
    next();
    return;
  }
  const origin = req.headers.origin;
  if (!origin) {
    res.status(403).json({ error: "Origem da requisição não permitida" });
    return;
  }
  const allowed = getFrontendCorsOrigins();
  if (!allowed.includes(origin)) {
    res.status(403).json({ error: "Origem da requisição não permitida" });
    return;
  }
  next();
}
