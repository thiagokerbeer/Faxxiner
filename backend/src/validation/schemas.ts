import { z } from "zod";
import { BookingStatus, Role } from "@prisma/client";
import { isProduction } from "../lib/env.js";

export const registerBodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(120),
  phone: z
    .union([z.string().max(30), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  role: z.nativeEnum(Role).refine((r) => r === Role.CLIENT || r === Role.DIARISTA, {
    message: "role deve ser CLIENT ou DIARISTA",
  }),
  acceptLgpdTerms: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar o tratamento dos dados pessoais conforme a política de privacidade (LGPD).",
  }),
});

export const loginBodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const deleteAccountBodySchema = z.object({
  password: z.string().min(1).max(128),
});

export const bookingCreateSchema = z.object({
  diaristUserId: z.string().uuid(),
  scheduledAt: z.string().min(1).max(64),
  notes: z.string().max(2000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const bookingStatusPatchSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

export const diaristaProfilePutSchema = z.object({
  bio: z.string().min(1).max(2000),
  city: z.string().min(1).max(120),
  neighborhoods: z.string().min(1).max(500),
  servicesOffered: z.string().min(1).max(2000),
  hourlyRateCents: z.number().int().min(0).max(10_000_000),
  photoUrl: z
    .union([z.string().max(2048), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .superRefine((val, ctx) => {
      if (val === null || val === undefined) return;
      let u: URL;
      try {
        u = new URL(val);
      } catch {
        ctx.addIssue({ code: "custom", message: "photoUrl deve ser uma URL válida" });
        return;
      }
      if (u.protocol === "https:") return;
      const localHttp =
        u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
      if (!isProduction() && localHttp) return;
      ctx.addIssue({
        code: "custom",
        message: "photoUrl deve usar HTTPS (http permitido só em localhost fora de produção)",
      });
    }),
  isActive: z.boolean().optional(),
});

export const diaristasListQuerySchema = z.object({
  city: z.string().max(120).optional(),
  maxHourly: z.coerce.number().int().min(0).max(500000).optional(),
});
