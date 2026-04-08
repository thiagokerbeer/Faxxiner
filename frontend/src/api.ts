const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function url(path: string): string {
  if (path.startsWith("http")) return path;
  if (base) return `${base}${path}`;
  return path;
}

/** Para download (blob) ou fetch manual com o mesmo host do `api()`. */
export function resolveApiPath(path: string): string {
  return url(path);
}

export type ApiError = { error: string };

type ApiAuthConfig = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
};

let apiAuth: ApiAuthConfig | null = null;

export function configureApiAuth(config: ApiAuthConfig): void {
  apiAuth = config;
}

const NO_REFRESH_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
];

function pathSkipsRefresh(p: string): boolean {
  const pathOnly = p.split("?")[0] ?? p;
  return NO_REFRESH_PREFIXES.some((prefix) => pathOnly === prefix);
}

async function trySessionRefresh(): Promise<boolean> {
  const res = await fetch(url("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { accessToken?: string };
  if (!data.accessToken || !apiAuth) return false;
  apiAuth.setAccessToken(data.accessToken);
  return true;
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  return doRequest<T>(path, false, init);
}

async function doRequest<T>(
  path: string,
  afterRefresh: boolean,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  const token = apiAuth?.getAccessToken() ?? null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined = init?.body as BodyInit | undefined;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const res = await fetch(url(path), {
    ...init,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(res.ok ? "Resposta inválida do servidor (não é JSON)" : `Erro ${res.status}`);
    }
  }

  if (!res.ok) {
    if (res.status === 401 && !afterRefresh && !pathSkipsRefresh(path)) {
      const refreshed = await trySessionRefresh();
      if (refreshed) return doRequest<T>(path, true, init);
    }
    const msg =
      data && typeof data === "object" && "error" in data && typeof (data as ApiError).error === "string"
        ? (data as ApiError).error
        : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
