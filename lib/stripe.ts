import Stripe from "stripe";

// Lazy singleton — a module-scope `new Stripe()` would make `next build`
// (page-data collection imports every route) crash when env vars are unset.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
  return _stripe;
}

// Proxy keeps the existing `stripe.checkout.sessions.create(...)` call sites
// working while deferring construction until first use at request time.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = client[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/**
 * Maps Stripe Price IDs to internal DB plan values.
 * DB plan values: 'free' | 'starter' | 'pro'
 * UI shows 'Plus' for starter, 'Pro' for pro.
 * Phase 5 uses 4 price IDs: starter monthly/yearly + pro monthly/yearly.
 * Built lazily for the same build-time reason as the client above.
 */
function getPriceMap(): Record<string, "starter" | "pro"> {
  const map: Record<string, "starter" | "pro"> = {};
  const entries: Array<[string | undefined, "starter" | "pro"]> = [
    [process.env.STRIPE_PRICE_STARTER_MONTHLY, "starter"],
    [process.env.STRIPE_PRICE_STARTER_YEARLY, "starter"],
    [process.env.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [process.env.STRIPE_PRICE_PRO_YEARLY, "pro"],
  ];
  for (const [priceId, plan] of entries) {
    if (priceId) map[priceId] = plan;
  }
  return map;
}

/**
 * Returns the DB plan value for a given Stripe price ID.
 * Falls back to 'free' for unrecognized price IDs.
 */
export function getPlanFromPriceId(
  priceId: string
): "free" | "starter" | "pro" {
  return getPriceMap()[priceId] ?? "free";
}
