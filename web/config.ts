// ─── Backend URL ───────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_BACKEND_URL in .env.local; falls back to the Render deploy.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

// ─── Stripe Mode ───────────────────────────────────────────────────────────────
// false = test keys, true = live keys
// Must match the key pair loaded in .env.local
export const useStripeLiveMode = false;

// ─── Site URL ──────────────────────────────────────────────────────────────────
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getfrugal.dev";