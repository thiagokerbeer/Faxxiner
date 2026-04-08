import type { Response } from "express";
import { getRefreshTokenMaxAgeSeconds, isProduction } from "./env.js";

export const REFRESH_COOKIE_NAME = "faxxiner_rt";

export function setRefreshCookie(res: Response, rawToken: string): void {
  const maxAgeSec = getRefreshTokenMaxAgeSeconds();
  const prod = isProduction();
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    maxAge: maxAgeSec * 1000,
    path: "/api/auth",
  });
}

export function clearRefreshCookie(res: Response): void {
  const prod = isProduction();
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    path: "/api/auth",
  });
}

export function readRefreshTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name !== REFRESH_COOKIE_NAME) continue;
    const v = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
  return null;
}
