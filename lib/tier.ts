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

/**
 * Per-plan resource caps for connections and projects.
 * Used by POST /api/connections and POST /api/projects to enforce limits.
 *
 * 'growth' mirrors 'starter' — kept for forward compatibility even though
 * Phase 5 billing only sells starter and pro.
 */
export const PLAN_LIMITS = {
  free:    { connections: 1, projects: 1 },
  starter: { connections: 3, projects: 5 },
  growth:  { connections: 3, projects: 5 },
  pro:     { connections: Infinity, projects: Infinity },
} as const;

/**
 * Returns the connection limit for a given plan.
 * Falls back to free limits for unrecognized plan values.
 */
export function getConnectionLimit(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.connections ?? PLAN_LIMITS.free.connections;
}

/**
 * Returns the project limit for a given plan.
 * Falls back to free limits for unrecognized plan values.
 */
export function getProjectLimit(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.projects ?? PLAN_LIMITS.free.projects;
}
