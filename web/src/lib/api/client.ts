// Typed JSON client for the Rails API (/api/v1). No business logic lives here.
import { tokenStore } from "@/lib/auth/token-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, string[]> | null };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]> | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const current = tokenStore.get();
  if (!current) return false;
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { access_token: string; refresh_token: string };
      tokenStore.set({ accessToken: data.access_token, refreshToken: data.refresh_token });
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function buildInit(options: Options): RequestInit {
  const { body, auth = true, headers, ...rest } = options;
  const h: Record<string, string> = { Accept: "application/json", ...(headers as Record<string, string>) };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) h["Content-Type"] = "application/json";
  const tokens = auth ? tokenStore.get() : null;
  if (tokens) h.Authorization = `Bearer ${tokens.accessToken}`;
  return { ...rest, headers: h, body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body) };
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const url = `${API_URL}/api/v1${path}`;
  let response = await fetch(url, buildInit(options));

  if (response.status === 401 && options.auth !== false && (await refreshTokens())) {
    response = await fetch(url, buildInit(options));
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.code ?? "unknown_error",
      body?.error?.message ?? response.statusText,
      body?.error?.details,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
