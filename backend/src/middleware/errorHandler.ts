import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/AppError.js";
import { isProduction } from "../lib/env.js";
import { logError } from "../lib/logger.js";
import {
  DB_AUTH_FAILED_MESSAGE,
  DB_UNAVAILABLE_MESSAGE,
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";

function isJsonParseError(err: unknown): boolean {
  if (err instanceof SyntaxError && err.message.includes("JSON")) return true;
  const o = err as { type?: string; status?: number; statusCode?: number };
  return o.type === "entity.parse.failed" || (o.status === 400 && String(o).includes("JSON"));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const rid = req.requestId;

  if (err instanceof AppError) {
    if (!res.headersSent) {
      res.status(err.statusCode).json({ error: err.message, ...(err.code ? { code: err.code } : {}) });
    }
    return;
  }

  if (isJsonParseError(err)) {
    logError("json-parse", err, rid);
    if (!res.headersSent) {
      res.status(400).json({ error: "JSON inválido ou corpo malformado" });
    }
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logError(`prisma-${err.code}`, err, rid);
    if (!res.headersSent) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Registro duplicado ou conflito de unicidade" });
        return;
      }
      if (err.code === "P2025") {
        res.status(404).json({ error: "Registro não encontrado" });
        return;
      }
    }
  }

  if (isDatabaseUnreachable(err)) {
    logError("db-unreachable", err, rid);
    if (!res.headersSent) {
      res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
    }
    return;
  }

  if (isDatabaseAuthFailed(err)) {
    logError("db-auth", err, rid);
    if (!res.headersSent) {
      res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
    }
    return;
  }

  logError("unhandled", err, rid);
  if (res.headersSent) return;
  res.status(500).json({
    error: isProduction() ? "Erro interno" : err instanceof Error ? err.message : "Erro interno",
  });
}
