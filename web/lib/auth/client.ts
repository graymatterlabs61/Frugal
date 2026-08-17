import { createAuthClient } from "better-auth/react";
import { BACKEND_URL } from "@/config";

const TOKEN_KEY = "frugal_bearer_token";

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  // Non-httpOnly cookie so a future server-rendered dashboard can read it via next/headers.
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

/** Bearer token for cross-domain /api/v1/* calls (web and api aren't same-site, so cookies alone don't reach the api). */
export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) storeToken(token);
    },
  },
});

export const {
  signIn,
  signUp,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient;

export async function signOut() {
  const result = await authClient.signOut();
  clearToken();
  return result;
}
