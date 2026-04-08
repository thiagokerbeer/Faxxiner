import { randomBytes } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { getBcryptRounds } from "../lib/env.js";
import { logError } from "../lib/logger.js";
import { parseBody } from "../lib/zodUtil.js";
import { authMiddleware } from "../middleware/auth.js";
import { DB_UNAVAILABLE_MESSAGE, isDatabaseUnreachable } from "../lib/dbError.js";
import { deleteAccountBodySchema } from "../validation/schemas.js";

export const meRouter = Router();
meRouter.use(authMiddleware);

/** Portabilidade / cópia dos dados do titular (LGPD, art. 18, II) */
meRouter.get("/data-export", async (req, res) => {
  try {
    const uid = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        privacyConsentAt: true,
        diaristProfile: true,
        bookingsAsClient: {
          orderBy: { scheduledAt: "desc" },
          include: {
            diarist: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        bookingsAsDiarist: {
          orderBy: { scheduledAt: "desc" },
          include: {
            client: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="faxxiner-meus-dados.json"');
    res.json({
      exportedAt: new Date().toISOString(),
      titular: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        contaEncerradaEm: user.deletedAt,
        consentimentoPrivacidadeEm: user.privacyConsentAt,
      },
      perfilProfissional: user.diaristProfile,
      agendamentosComoCliente: user.bookingsAsClient,
      agendamentosComoProfissional: user.bookingsAsDiarist,
      aviso:
        "Este arquivo contém seus dados pessoais conforme tratados na plataforma. Guarde-o com segurança.",
    });
  } catch (e) {
    logError("GET /api/me/data-export", e);
    if (isDatabaseUnreachable(e)) {
      res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
      return;
    }
    res.status(500).json({ error: "Erro ao exportar dados" });
  }
});

/**
 * Direito à eliminação com anonimização (LGPD, art. 18, VI),
 * preservando a mínima necessidade para registros já vinculados a terceiros.
 */
meRouter.delete("/account", async (req, res) => {
  const parsed = parseBody(deleteAccountBodySchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const { password } = parsed.data;
  const uid = req.user!.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    if (user.deletedAt) {
      res.status(410).json({ error: "Conta já encerrada" });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Senha incorreta" });
      return;
    }

    const anonEmail = `excluido.${user.id}@anon.faxxiner.invalid`;
    const randomHash = await bcrypt.hash(randomBytes(48).toString("hex"), getBcryptRounds());

    await prisma.$transaction(async (tx) => {
      await tx.refreshSession.deleteMany({ where: { userId: uid } });

      await tx.user.update({
        where: { id: uid },
        data: {
          email: anonEmail,
          name: "Titular excluído",
          phone: null,
          passwordHash: randomHash,
          deletedAt: new Date(),
        },
      });

      const prof = await tx.diaristProfile.findUnique({ where: { userId: uid } });
      if (prof) {
        await tx.diaristProfile.update({
          where: { userId: uid },
          data: {
            isActive: false,
            bio: "Perfil removido a pedido do titular.",
            city: "—",
            neighborhoods: "—",
            servicesOffered: "—",
            photoUrl: null,
          },
        });
      }
    });

    res.status(204).send();
  } catch (e) {
    logError("DELETE /api/me/account", e);
    if (isDatabaseUnreachable(e)) {
      res.status(503).json({ error: DB_UNAVAILABLE_MESSAGE });
      return;
    }
    res.status(500).json({ error: "Erro ao encerrar conta" });
  }
});
