/**
 * Variáveis críticas em produção (LGPD / segurança).
 * Chamado no bootstrap antes de aceitar tráfego.
 */
export function assertEnvAtStartup(): void {
  if (process.env.NODE_ENV !== "production") return;
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "Em produção, JWT_SECRET é obrigatório e deve ter pelo menos 32 caracteres aleatórios."
    );
  }
}

export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) {
      throw new Error("JWT_SECRET inválido");
    }
    return s;
  }
  return s ?? "dev-insecure-secret";
}

export function getBcryptRounds(): number {
  const n = Number.parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  if (Number.isNaN(n)) return 12;
  return Math.min(15, Math.max(10, n));
}

export function getJwtExpiresIn(): string {
  const v = process.env.JWT_EXPIRES_IN?.trim();
  return v && v.length > 0 ? v : "7d";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
