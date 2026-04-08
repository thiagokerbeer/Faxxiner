import rateLimit from "express-rate-limit";

const window15m = 15 * 60 * 1000;

/** Limite global (janela 15 min). Ajuste com RATE_LIMIT_GLOBAL_MAX no ambiente. */
export const globalApiLimiter = rateLimit({
  windowMs: window15m,
  max: Math.max(60, Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? "600")),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});

export const authLoginLimiter = rateLimit({
  windowMs: window15m,
  max: Math.max(3, Number(process.env.RATE_LIMIT_LOGIN_MAX ?? "10")),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Aguarde antes de tentar de novo." },
});

export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Math.max(2, Number(process.env.RATE_LIMIT_REGISTER_MAX ?? "5")),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de cadastros por hora atingido. Tente mais tarde." },
});
