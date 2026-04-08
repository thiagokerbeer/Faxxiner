import { createHash, randomBytes } from "node:crypto";
import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  DB_AUTH_FAILED_MESSAGE,
  DB_UNAVAILABLE_MESSAGE,
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";
import { authMiddleware, signToken } from "../middleware/auth.js";
import { getBcryptRounds, getRefreshTokenMaxAgeSeconds } from "../lib/env.js";
import { logError } from "../lib/logger.js";
import { parseBody } from "../lib/zodUtil.js";
import { loginBodySchema, registerBodySchema } from "../validation/schemas.js";
import {
  authLoginLimiter,
  authLogoutLimiter,
  authRefreshLimiter,
  authRegisterLimiter,
} from "../middleware/rateLimits.js";
import { clearRefreshCookie, readRefreshTokenFromCookie, setRefreshCookie } from "../lib/cookieRefresh.js";
import { requireSpaOriginForCookieRoutes } from "../middleware/originAllowlist.js";
import { LOGIN_TIMING_DUMMY_HASH } from "../lib/loginTiming.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const authRouter = Router();

function hashRefreshRaw(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

async function issueAccessAndRefreshSession(
  user: { id: string; role: Role },
  res: Response
): Promise<{ accessToken: string }> {
  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashRefreshRaw(raw);
  const maxAgeSec = getRefreshTokenMaxAgeSeconds();
  const expiresAt = new Date(Date.now() + maxAgeSec * 1000);
  await prisma.refreshSession.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });
  setRefreshCookie(res, raw);
  return { accessToken: signToken({ userId: user.id, role: user.role }) };
}

authRouter.post("/register", authRegisterLimiter, async (req, res) => {
  const parsed = parseBody(registerBodySchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const { email, password, name, phone, role } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ error: "E-mail já cadastrado" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, getBcryptRounds());
    const now = new Date();
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone ?? null,
        role,
        privacyConsentAt: now,
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    const { accessToken } = await issueAccessAndRefreshSession(user, res);
    res.status(201).json({ user, accessToken });
  } catch (e) {
    logError("POST /auth/register", e, req.requestId);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      res.status(409).json({ error: "E-mail já cadastrado" });
      return;
    }
    if (isDatabaseUnreachable(e)) {
      res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
      return;
    }
    if (isDatabaseAuthFailed(e)) {
      res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
      return;
    }
    res.status(500).json({ error: "Erro ao registrar" });
  }
});

authRouter.post("/login", authLoginLimiter, async (req, res) => {
  const parsed = parseBody(loginBodySchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const hashForCompare =
      user && !user.deletedAt ? user.passwordHash : LOGIN_TIMING_DUMMY_HASH;
    const ok = await bcrypt.compare(password, hashForCompare);
    if (!user || user.deletedAt || !ok) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const { accessToken } = await issueAccessAndRefreshSession(
      { id: user.id, role: user.role },
      res
    );
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e) {
    logError("POST /auth/login", e, req.requestId);
    if (isDatabaseUnreachable(e)) {
      res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
      return;
    }
    if (isDatabaseAuthFailed(e)) {
      res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
      return;
    }
    res.status(500).json({ error: "Erro ao entrar" });
  }
});

authRouter.post(
  "/refresh",
  authRefreshLimiter,
  requireSpaOriginForCookieRoutes,
  async (req, res) => {
    const raw = readRefreshTokenFromCookie(req.headers.cookie);
    if (!raw || raw.length > 128) {
      clearRefreshCookie(res);
      res.status(401).json({ error: "Sessão expirada" });
      return;
    }
    const tokenHash = hashRefreshRaw(raw);

    try {
      const session = await prisma.refreshSession.findUnique({
        where: { tokenHash },
        include: {
          user: { select: { id: true, role: true, deletedAt: true } },
        },
      });

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        clearRefreshCookie(res);
        res.status(401).json({ error: "Sessão expirada" });
        return;
      }
      const u = session.user;
      if (!u || u.deletedAt) {
        clearRefreshCookie(res);
        res.status(401).json({ error: "Sessão inválida ou conta encerrada" });
        return;
      }

      const maxAgeSec = getRefreshTokenMaxAgeSeconds();
      const newExpiresAt = new Date(Date.now() + maxAgeSec * 1000);
      const newRaw = randomBytes(32).toString("hex");
      const newHash = hashRefreshRaw(newRaw);

      await prisma.$transaction([
        prisma.refreshSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        }),
        prisma.refreshSession.create({
          data: { userId: u.id, tokenHash: newHash, expiresAt: newExpiresAt },
        }),
      ]);

      setRefreshCookie(res, newRaw);
      const accessToken = signToken({ userId: u.id, role: u.role });
      res.json({ accessToken });
    } catch (e) {
      logError("POST /auth/refresh", e, req.requestId);
      if (isDatabaseUnreachable(e)) {
        res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
        return;
      }
      if (isDatabaseAuthFailed(e)) {
        res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
        return;
      }
      clearRefreshCookie(res);
      res.status(500).json({ error: "Erro ao renovar sessão" });
    }
  }
);

authRouter.post(
  "/logout",
  authLogoutLimiter,
  requireSpaOriginForCookieRoutes,
  async (req, res) => {
    const raw = readRefreshTokenFromCookie(req.headers.cookie);
    if (raw && raw.length <= 128) {
      const tokenHash = hashRefreshRaw(raw);
      try {
        await prisma.refreshSession.updateMany({
          where: { tokenHash, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      } catch (e) {
        logError("POST /auth/logout", e, req.requestId);
        if (isDatabaseUnreachable(e)) {
          res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
          return;
        }
        if (isDatabaseAuthFailed(e)) {
          res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
          return;
        }
        res.status(500).json({ error: "Erro ao sair" });
        return;
      }
    }
    clearRefreshCookie(res);
    res.status(204).send();
  }
);

authRouter.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          diaristProfile: true,
        },
      });
      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }
      res.json(user);
    } catch (e) {
      logError("GET /auth/me", e, req.requestId);
      if (isDatabaseUnreachable(e)) {
        res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
        return;
      }
      if (isDatabaseAuthFailed(e)) {
        res.status(503).json({ error: DB_AUTH_FAILED_MESSAGE });
        return;
      }
      res.status(500).json({ error: "Erro ao carregar perfil" });
    }
  })
);
