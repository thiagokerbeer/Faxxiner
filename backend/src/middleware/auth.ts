import type { Request, Response, NextFunction } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { getJwtAccessExpiresIn, getJwtSecret } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  DB_AUTH_FAILED_MESSAGE,
  DB_UNAVAILABLE_MESSAGE,
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";

export type JwtPayload = { userId: string; role: Role };

const MAX_BEARER_TOKEN_CHARS = 4096;

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret() as Secret, {
    expiresIn: getJwtAccessExpiresIn(),
  } as SignOptions);
}

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Token ausente" });
    return;
  }
  if (token.length > MAX_BEARER_TOKEN_CHARS) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const u = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, deletedAt: true, role: true },
    });
    if (!u || u.deletedAt) {
      res.status(401).json({ error: "Sessão inválida ou conta encerrada" });
      return;
    }
    if (u.role !== decoded.role) {
      res.status(401).json({ error: "Sessão desatualizada — entre novamente" });
      return;
    }
    req.user = { userId: u.id, role: u.role };
    next();
  } catch (e) {
    if (isDatabaseUnreachable(e)) {
      if (!res.headersSent) res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
      return;
    }
    if (isDatabaseAuthFailed(e)) {
      if (!res.headersSent) res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
      return;
    }
    if (!res.headersSent) res.status(401).json({ error: "Token inválido" });
  }
});

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Sem permissão" });
      return;
    }
    next();
  };
}
