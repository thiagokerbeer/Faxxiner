import { z } from "zod";
import { Role } from "@prisma/client";

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
