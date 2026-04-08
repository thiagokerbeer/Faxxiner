import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";
import {
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";
import { logError } from "../lib/logger.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireRole(Role.ADMIN));

/** Visão geral para o painel do administrador do site */
adminRouter.get(
  "/overview",
  asyncHandler(async (req, res) => {
    try {
      const [clientCount, diaristaCount, adminCount, activeProfiles, bookingsByStatus, recentBookings, recentUsers] =
        await Promise.all([
          prisma.user.count({ where: { role: Role.CLIENT, deletedAt: null } }),
          prisma.user.count({ where: { role: Role.DIARISTA, deletedAt: null } }),
          prisma.user.count({ where: { role: Role.ADMIN, deletedAt: null } }),
          prisma.diaristProfile.count({ where: { isActive: true } }),
          prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
          prisma.booking.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
              client: { select: { id: true, name: true, email: true, phone: true } },
              diarist: { select: { id: true, name: true, email: true, phone: true } },
            },
          }),
          prisma.user.findMany({
            where: { deletedAt: null },
            take: 15,
            orderBy: { createdAt: "desc" },
            select: { id: true, email: true, name: true, role: true, createdAt: true, phone: true },
          }),
        ]);

      const statusCounts: Record<string, number> = {};
      for (const row of bookingsByStatus) {
        statusCounts[row.status] = row._count._all;
      }

      res.json({
        users: {
          clients: clientCount,
          diaristas: diaristaCount,
          admins: adminCount,
          activeDiaristProfiles: activeProfiles,
        },
        bookingsByStatus: statusCounts,
        recentBookings,
        recentUsers,
      });
    } catch (e) {
      logError("GET /admin/overview", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao carregar painel admin");
    }
  })
);
