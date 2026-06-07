import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

/**
 * Maps Stripe Price IDs to internal DB plan values.
 * DB plan values: 'free' | 'starter' | 'pro'
 * UI shows 'Plus' for starter, 'Pro' for pro.
 * Phase 5 uses 4 price IDs: starter monthly/yearly + pro monthly/yearly.
 */
export const PRICE_MAP: Record<string, "starter" | "pro"> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY!]: "starter",
  [process.env.STRIPE_PRICE_STARTER_YEARLY!]: "starter",
  [process.env.STRIPE_PRICE_PRO_MONTHLY!]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY!]: "pro",
};

/**
 * Returns the DB plan value for a given Stripe price ID.
 * Falls back to 'free' for unrecognized price IDs.
 */
export function getPlanFromPriceId(
  priceId: string
): "free" | "starter" | "pro" {
  return PRICE_MAP[priceId] ?? "free";
}
