import { Router } from "express";
import { BookingStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";
import { canTransitionBookingStatus } from "../lib/bookingStateMachine.js";
import { isUuid } from "../lib/uuid.js";
import { parseBody } from "../lib/zodUtil.js";
import { bookingCreateSchema, bookingStatusPatchSchema } from "../validation/schemas.js";
import {
  isDatabaseAuthFailed,
  isDatabaseUnreachable,
} from "../lib/dbError.js";
import { logError } from "../lib/logger.js";

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

const MAX_CLIENT_DIARISTA_LIST = 300;
const MAX_PENDING_PER_CLIENT = Math.max(1, Math.min(50, Number(process.env.MAX_PENDING_CLIENT_BOOKINGS ?? "15")));

bookingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const uid = req.user!.userId;
    const role = req.user!.role;

    try {
      const list =
        role === Role.ADMIN
          ? await prisma.booking.findMany({
              include: {
                client: { select: { id: true, name: true, phone: true, email: true } },
                diarist: { select: { id: true, name: true, phone: true, email: true } },
              },
              orderBy: { scheduledAt: "desc" },
              take: 300,
            })
          : role === Role.CLIENT
            ? await prisma.booking.findMany({
                where: { clientId: uid },
                include: {
                  diarist: { select: { id: true, name: true, phone: true } },
                },
                orderBy: { scheduledAt: "desc" },
                take: MAX_CLIENT_DIARISTA_LIST,
              })
            : await prisma.booking.findMany({
                where: { diaristId: uid },
                include: {
                  client: { select: { id: true, name: true, phone: true } },
                },
                orderBy: { scheduledAt: "desc" },
                take: MAX_CLIENT_DIARISTA_LIST,
              });

      res.json(list);
    } catch (e) {
      logError("GET /bookings", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao listar agendamentos");
    }
  })
);

bookingsRouter.post(
  "/",
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const parsed = parseBody(bookingCreateSchema, req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message });
      return;
    }
    const { diaristUserId, scheduledAt, notes, address } = parsed.data;

    try {
      const diarist = await prisma.user.findFirst({
        where: { id: diaristUserId, role: Role.DIARISTA, deletedAt: null },
        include: { diaristProfile: true },
      });
      if (!diarist?.diaristProfile?.isActive) {
        res.status(400).json({ error: "Diarista inválida ou indisponível" });
        return;
      }

      const when = new Date(scheduledAt);
      if (Number.isNaN(when.getTime())) {
        res.status(400).json({ error: "Data inválida" });
        return;
      }

      const pendingCount = await prisma.booking.count({
        where: { clientId: req.user!.userId, status: BookingStatus.PENDING },
      });
      if (pendingCount >= MAX_PENDING_PER_CLIENT) {
        res.status(429).json({
          error: `Limite de ${MAX_PENDING_PER_CLIENT} agendamentos pendentes atingido. Cancele ou conclua pendentes antes de criar outro.`,
        });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          clientId: req.user!.userId,
          diaristId: diarist.id,
          scheduledAt: when,
          notes: notes ?? null,
          address: address ?? null,
        },
        include: {
          diarist: { select: { id: true, name: true, phone: true } },
        },
      });

      res.status(201).json(booking);
    } catch (e) {
      logError("POST /bookings", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao criar agendamento");
    }
  })
);

bookingsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    if (!isUuid(req.params.id)) {
      res.status(400).json({ error: "ID de agendamento inválido" });
      return;
    }

    const parsed = parseBody(bookingStatusPatchSchema, req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message });
      return;
    }
    const { status } = parsed.data;

    try {
      const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
      if (!booking) {
        res.status(404).json({ error: "Agendamento não encontrado" });
        return;
      }

      const uid = req.user!.userId;
      const role = req.user!.role;

      if (role === Role.ADMIN) {
        res.status(403).json({ error: "Administrador altera status apenas pelo suporte (fora deste demo)" });
        return;
      }
      if (role === Role.CLIENT && booking.clientId !== uid) {
        res.status(403).json({ error: "Sem permissão" });
        return;
      }
      if (role === Role.DIARISTA && booking.diaristId !== uid) {
        res.status(403).json({ error: "Sem permissão" });
        return;
      }

      if (!canTransitionBookingStatus(role, booking.status, status)) {
        res.status(400).json({ error: "Transição de status não permitida" });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { status },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          diarist: { select: { id: true, name: true, phone: true } },
        },
      });

      res.json(updated);
    } catch (e) {
      logError("PATCH /bookings/:id/status", e, req.requestId);
      if (isDatabaseUnreachable(e) || isDatabaseAuthFailed(e)) throw e;
      throw new AppError(500, "Erro ao atualizar status");
    }
  })
);
