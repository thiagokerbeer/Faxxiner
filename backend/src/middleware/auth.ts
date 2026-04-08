import type { Request, Response, NextFunction } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { getJwtExpiresIn, getJwtSecret } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";

export type JwtPayload = { userId: string; role: Role };

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret() as Secret, {
    expiresIn: getJwtExpiresIn(),
  } as SignOptions);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Token ausente" });
    return;
  }

  void (async () => {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
      const u = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { deletedAt: true },
      });
      if (!u || u.deletedAt) {
        res.status(401).json({ error: "Sessão inválida ou conta encerrada" });
        return;
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Token inválido" });
    }
  })();
}

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
