import { Router } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  DB_AUTH_FAILED_MESSAGE,
  DB_UNAVAILABLE_MESSAGE,
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";
import { authMiddleware, signToken } from "../middleware/auth.js";
import { getBcryptRounds } from "../lib/env.js";
import { logError } from "../lib/logger.js";
import { parseBody } from "../lib/zodUtil.js";
import { loginBodySchema, registerBodySchema } from "../validation/schemas.js";
import { authLoginLimiter, authRegisterLimiter } from "../middleware/rateLimits.js";

export const authRouter = Router();

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

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (e) {
    logError("POST /auth/register", e);
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
    if (!user || user.deletedAt) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e) {
    logError("POST /auth/login", e);
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

authRouter.get("/me", authMiddleware, async (req, res) => {
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
    logError("GET /auth/me", e);
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
});
