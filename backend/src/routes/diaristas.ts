import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";
import { routeParamAsString } from "../lib/routeParam.js";
import { isUuid } from "../lib/uuid.js";
import { parseBody } from "../lib/zodUtil.js";
import { diaristaProfilePutSchema, diaristasListQuerySchema } from "../validation/schemas.js";
import {
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";
import { logError } from "../lib/logger.js";

export const diaristasRouter = Router();

const publicSelect = {
  id: true,
  bio: true,
  city: true,
  neighborhoods: true,
  hourlyRateCents: true,
  servicesOffered: true,
  photoUrl: true,
  isActive: true,
  user: {
    select: { id: true, name: true, phone: true },
  },
} as const;

/** Lista diaristas ativos (público para portfólio; em produção avalie rate limit) */
diaristasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = diaristasListQuerySchema.safeParse({
      city: req.query.city,
      maxHourly: req.query.maxHourly,
    });
    if (!q.success) {
      res.status(400).json({ error: "Parâmetros de busca inválidos" });
      return;
    }
    const { city, maxHourly } = q.data;
    const cityFilter = city?.trim() ?? "";

    try {
      const rows = await prisma.diaristProfile.findMany({
        where: {
          isActive: true,
          user: { deletedAt: null },
          ...(cityFilter ? { city: { contains: cityFilter, mode: "insensitive" } } : {}),
          ...(maxHourly !== undefined
            ? { hourlyRateCents: { lte: maxHourly * 100 } }
            : {}),
        },
        select: publicSelect,
        orderBy: { hourlyRateCents: "asc" },
      });

      res.json(rows);
    } catch (e) {
      logError("GET /diaristas", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao listar profissionais");
    }
  })
);

/** Perfil logado da diarista — antes de /:id */
diaristasRouter.get(
  "/me/profile",
  authMiddleware,
  requireRole(Role.DIARISTA),
  asyncHandler(async (req, res) => {
    try {
      const profile = await prisma.diaristProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      res.json(profile);
    } catch (e) {
      logError("GET /diaristas/me/profile", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao carregar seu perfil");
    }
  })
);

diaristasRouter.put(
  "/me/profile",
  authMiddleware,
  requireRole(Role.DIARISTA),
  asyncHandler(async (req, res) => {
    const parsed = parseBody(diaristaProfilePutSchema, req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message });
      return;
    }
    const { bio, city, neighborhoods, hourlyRateCents, servicesOffered, photoUrl, isActive } = parsed.data;

    try {
      const profile = await prisma.diaristProfile.upsert({
        where: { userId: req.user!.userId },
        create: {
          userId: req.user!.userId,
          bio,
          city,
          neighborhoods,
          hourlyRateCents: Math.round(hourlyRateCents),
          servicesOffered,
          photoUrl: photoUrl ?? null,
          isActive: typeof isActive === "boolean" ? isActive : true,
        },
        update: {
          bio,
          city,
          neighborhoods,
          hourlyRateCents: Math.round(hourlyRateCents),
          servicesOffered,
          ...(photoUrl !== undefined ? { photoUrl } : {}),
          ...(typeof isActive === "boolean" ? { isActive } : {}),
        },
      });

      res.json(profile);
    } catch (e) {
      logError("PUT /diaristas/me/profile", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao salvar perfil");
    }
  })
);

diaristasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const profileId = routeParamAsString(req.params.id);
    if (!isUuid(profileId)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    try {
      const row = await prisma.diaristProfile.findFirst({
        where: { id: profileId, isActive: true, user: { deletedAt: null } },
        select: publicSelect,
      });
      if (!row) {
        res.status(404).json({ error: "Profissional não encontrado" });
        return;
      }
      res.json(row);
    } catch (e) {
      logError("GET /diaristas/:id", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao carregar perfil");
    }
  })
);
