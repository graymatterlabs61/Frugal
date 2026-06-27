import { BACKEND_URL } from "@/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...fetchOptions } = options;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const err = body.error as { code?: string; message?: string } | undefined;
    throw new ApiError(
      res.status,
      err?.code ?? "unknown",
      err?.message ?? res.statusText,
    );
  }

  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as Record<string, unknown>;
  return json as T;
}

export const apiClient = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),
  del: (path: string, token?: string) =>
    request<void>(path, { method: "DELETE", token }),
};
