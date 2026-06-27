// ─── Environment Toggle ────────────────────────────────────────────────────────
// Comment/uncomment the line you want. One must be active at a time.

// Local dev (frontend: localhost:3000, backend: localhost:4000)
export const BACKEND_URL = "http://localhost:4000";

// Production (Render backend)
// export const BACKEND_URL = "https://frugal-66tx.onrender.com";

// ─── Stripe Mode ───────────────────────────────────────────────────────────────
// false = test keys, true = live keys
// Must match the key pair loaded in .env.local
export const useStripeLiveMode = false;

// ─── Site URL ──────────────────────────────────────────────────────────────────
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getfrugal.dev";