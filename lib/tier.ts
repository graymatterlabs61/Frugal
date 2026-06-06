/**
 * lib/tier.ts — Feature gate functions for Frugal plan tiers.
 *
 * DB plan values: 'free' | 'starter' | 'growth' | 'pro'
 *
 * UI shows 'Plus' for starter/growth, 'Pro' for pro.
 * These functions always check DB values — never UI labels.
 */

/**
 * Returns true if the user's plan allows creating budget rules.
 * Free users cannot create rules; all paid plans (starter, growth, pro) can.
 */
export function canCreateBudgetRules(plan: string): boolean {
  return plan !== "free";
}

/**
 * Returns true if the user's plan allows the "block" action on rules.
 * Requires any paid plan (starter, growth, or pro).
 */
export function canUseBlock(plan: string): boolean {
  return plan !== "free";
}

/**
 * Returns true if the user's plan allows the "throttle" action on rules.
 * Throttle is Pro-only — requires plan === 'pro'.
 */
export function canUseThrottle(plan: string): boolean {
  return plan === "pro";
}
