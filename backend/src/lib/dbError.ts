/** Resposta amigável quando o Postgres não está rodando / não alcançável. */
export function isDatabaseUnreachable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Can't reach database") ||
    msg.includes("P1001") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("Connection refused")
  );
}

/** Credenciais ou banco na URL não batem com o Postgres (ex.: volume Docker criado com outro usuário). Prisma P1000. */
export function isDatabaseAuthFailed(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("P1000") || msg.includes("Authentication failed against database");
}

export const DB_UNAVAILABLE_MESSAGE =
  "Servidor de banco de dados offline. Na raiz do projeto rode: docker compose up -d (porta 5433). Se usar Postgres local, ajuste DATABASE_URL no .env.";

export const DB_AUTH_FAILED_MESSAGE =
  "O banco recusou usuário ou senha. O volume do Docker pode ter sido criado com credenciais antigas: na raiz do projeto rode `docker compose down -v` e depois `docker compose up -d` (isso apaga dados locais), em seguida no backend `npx prisma migrate dev` e `npm run db:seed`. Ou ajuste DATABASE_URL no backend/.env para coincidir com o usuário/senha que o seu Postgres realmente usa.";
