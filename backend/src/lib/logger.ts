import { isProduction } from "./env.js";

/** Evita vazar corpo de requisição ou tokens em logs. */
export function logError(context: string, err: unknown): void {
  if (err instanceof Error) {
    console.error(`[faxxiner] ${context}:`, err.message);
    if (!isProduction() && err.stack) {
      console.error(err.stack);
    }
  } else {
    console.error(`[faxxiner] ${context}:`, err);
  }
}
