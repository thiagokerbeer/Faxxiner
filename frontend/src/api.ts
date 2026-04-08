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

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined = init?.body as BodyInit | undefined;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const res = await fetch(url(path), { ...init, headers, body });
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data && typeof (data as ApiError).error === "string"
        ? (data as ApiError).error
        : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
