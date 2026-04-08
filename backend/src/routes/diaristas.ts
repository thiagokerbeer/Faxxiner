import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";

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
diaristasRouter.get("/", async (req, res) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
    const maxHourly = req.query.maxHourly
      ? parseInt(String(req.query.maxHourly), 10)
      : undefined;

    const rows = await prisma.diaristProfile.findMany({
      where: {
        isActive: true,
        user: { deletedAt: null },
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(Number.isFinite(maxHourly)
          ? { hourlyRateCents: { lte: (maxHourly as number) * 100 } }
          : {}),
      },
      select: publicSelect,
      orderBy: { hourlyRateCents: "asc" },
    });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar profissionais" });
  }
});

/** Perfil logado da diarista — antes de /:id */
diaristasRouter.get("/me/profile", authMiddleware, requireRole(Role.DIARISTA), async (req, res) => {
  try {
    const profile = await prisma.diaristProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao carregar seu perfil" });
  }
});

diaristasRouter.put("/me/profile", authMiddleware, requireRole(Role.DIARISTA), async (req, res) => {
  try {
    const {
      bio,
      city,
      neighborhoods,
      hourlyRateCents,
      servicesOffered,
      photoUrl,
      isActive,
    } = req.body as Record<string, unknown>;

    if (
      typeof bio !== "string" ||
      typeof city !== "string" ||
      typeof neighborhoods !== "string" ||
      typeof servicesOffered !== "string" ||
      typeof hourlyRateCents !== "number"
    ) {
      res.status(400).json({
        error: "bio, city, neighborhoods, servicesOffered e hourlyRateCents (número, em centavos) são obrigatórios",
      });
      return;
    }

    const profile = await prisma.diaristProfile.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        bio,
        city,
        neighborhoods,
        hourlyRateCents: Math.round(hourlyRateCents),
        servicesOffered,
        photoUrl: typeof photoUrl === "string" ? photoUrl : null,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      update: {
        bio,
        city,
        neighborhoods,
        hourlyRateCents: Math.round(hourlyRateCents),
        servicesOffered,
        ...(typeof photoUrl === "string" ? { photoUrl } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });

    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao salvar perfil" });
  }
});

diaristasRouter.get("/:id", async (req, res) => {
  try {
    const row = await prisma.diaristProfile.findFirst({
      where: { id: req.params.id, isActive: true, user: { deletedAt: null } },
      select: publicSelect,
    });
    if (!row) {
      res.status(404).json({ error: "Profissional não encontrado" });
      return;
    }
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao carregar perfil" });
  }
});
