import { isProduction } from "./env.js";

type AccessPayload = {
  requestId?: string;
  method: string;
  path: string;
  status: number;
  ms: number;
};

/** Evita vazar corpo de requisição ou tokens em logs. */
export function logError(context: string, err: unknown, requestId?: string): void {
  const rid = requestId ? ` rid=${requestId}` : "";
  if (err instanceof Error) {
    const line = isProduction()
      ? JSON.stringify({
          level: "error",
          context,
          message: err.message,
          requestId: requestId ?? null,
        })
      : `[faxxiner] ${context}:${rid} ${err.message}`;
    console.error(line);
    if (!isProduction() && err.stack) {
      console.error(err.stack);
    }
  } else {
    console.error(`[faxxiner] ${context}:${rid}`, err);
  }
}

/** Log de acesso ao final da resposta (sem corpo / sem Authorization). */
export function logAccess(p: AccessPayload): void {
  if (isProduction()) {
    console.log(
      JSON.stringify({
        level: "access",
        requestId: p.requestId ?? null,
        method: p.method,
        path: p.path,
        status: p.status,
        ms: p.ms,
      })
    );
  }
}
