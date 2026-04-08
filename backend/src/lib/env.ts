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

/** Access JWT (Bearer). Curto por padrão; refresh fica no cookie httpOnly. */
export function getJwtAccessExpiresIn(): string {
  const a = process.env.JWT_ACCESS_EXPIRES_IN?.trim();
  if (a && a.length > 0) return a;
  const legacy = process.env.JWT_EXPIRES_IN?.trim();
  if (legacy && legacy.length > 0) return legacy;
  return "15m";
}

/**
 * Duração do refresh cookie / sessão no banco.
 * Formato: número (segundos) ou sufixo d|h|m|s (ex.: 30d, 12h, 15m).
 */
export function getRefreshTokenMaxAgeSeconds(): number {
  const raw = (process.env.JWT_REFRESH_EXPIRES_IN ?? "30d").trim();
  const parsed = parseDurationToSeconds(raw);
  if (parsed !== null) return Math.min(365 * 24 * 60 * 60, Math.max(60, parsed));
  return 30 * 24 * 60 * 60;
}

function parseDurationToSeconds(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return Number.parseInt(t, 10);
  const m = /^(\d+)\s*([dhms])$/i.exec(t);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = u === "d" ? 86400 : u === "h" ? 3600 : u === "m" ? 60 : 1;
  return n * mult;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Em produção, FRONTEND_ORIGIN é obrigatório (evita CORS aberto por engano).
 * Fora de produção, se vazio, usa localhost do Vite.
 */
function normalizeCorsOrigin(s: string): string {
  return s.replace(/\/+$/, "");
}

export function getFrontendCorsOrigins(): string[] {
  const raw = (process.env.FRONTEND_ORIGIN?.split(",") ?? [])
    .map((s) => normalizeCorsOrigin(s.trim()))
    .filter((s) => s.length > 0);
  if (isProduction()) {
    if (raw.length === 0) {
      throw new Error(
        "FRONTEND_ORIGIN é obrigatório em produção: defina uma ou mais URLs do frontend (ex.: https://app.vercel.app), separadas por vírgula."
      );
    }
    return raw;
  }
  return raw.length > 0 ? raw : ["http://localhost:5173"];
}
