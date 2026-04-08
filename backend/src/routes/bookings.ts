import { Router } from "express";
import { BookingStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

bookingsRouter.get("/", async (req, res) => {
  try {
    const uid = req.user!.userId;
    const role = req.user!.role;

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
            })
          : await prisma.booking.findMany({
              where: { diaristId: uid },
              include: {
                client: { select: { id: true, name: true, phone: true } },
              },
              orderBy: { scheduledAt: "desc" },
            });

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
});

bookingsRouter.post("/", requireRole(Role.CLIENT), async (req, res) => {
  try {
    const { diaristUserId, scheduledAt, notes, address } = req.body as {
      diaristUserId?: string;
      scheduledAt?: string;
      notes?: string;
      address?: string;
    };

    if (!diaristUserId || !scheduledAt) {
      res.status(400).json({ error: "diaristUserId e scheduledAt são obrigatórios" });
      return;
    }

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

    const booking = await prisma.booking.create({
      data: {
        clientId: req.user!.userId,
        diaristId: diaristUserId,
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
    console.error(e);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

bookingsRouter.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body as { status?: BookingStatus };
    const allowed: BookingStatus[] = [
      BookingStatus.ACCEPTED,
      BookingStatus.REJECTED,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
    ];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: "status inválido" });
      return;
    }

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
    if (role === Role.CLIENT) {
      if (booking.clientId !== uid) {
        res.status(403).json({ error: "Sem permissão" });
        return;
      }
      if (status !== BookingStatus.CANCELLED && status !== BookingStatus.COMPLETED) {
        res.status(403).json({ error: "Cliente só pode cancelar ou marcar como concluído" });
        return;
      }
    } else if (role === Role.DIARISTA) {
      if (booking.diaristId !== uid) {
        res.status(403).json({ error: "Sem permissão" });
        return;
      }
      if (
        status !== BookingStatus.ACCEPTED &&
        status !== BookingStatus.REJECTED &&
        status !== BookingStatus.COMPLETED
      ) {
        res.status(403).json({ error: "Diarista: aceitar, recusar ou concluir" });
        return;
      }
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
    console.error(e);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});
