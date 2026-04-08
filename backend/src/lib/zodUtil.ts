import type { ZodError, ZodSchema } from "zod";

function firstZodMessage(err: ZodError): string {
  const flat = err.flatten();
  const field = Object.values(flat.fieldErrors)[0];
  if (Array.isArray(field) && field[0]) return field[0];
  const form = flat.formErrors[0];
  if (form) return form;
  return "Dados inválidos";
}

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): { ok: true; data: T } | { ok: false; message: string } {
  const r = schema.safeParse(body);
  if (!r.success) {
    return { ok: false, message: firstZodMessage(r.error) };
  }
  return { ok: true, data: r.data };
}
