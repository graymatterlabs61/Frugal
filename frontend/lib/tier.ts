/**
 * lib/tier.ts — Feature gate functions for Frugal plan tiers.
 *
 * DB plan values (enum, never change): 'free' | 'starter' | 'growth' | 'pro'
 *
 * Display names:
 *   free    → "Free"    (individual, limited)
 *   starter → "Pro"     (personal tier — devs, engineering managers)
 *   growth  → "Team"    (corporate — small/mid orgs, per-user attribution)
 *   pro     → "Scale"   (corporate — large orgs / enterprise)
 *
 * These functions always check DB values — never UI labels.
 */

/**
 * Returns the human-readable display name for a plan DB value.
 */
export function getPlanDisplayName(plan: string): string {
  const map: Record<string, string> = {
    free: "Free",
    starter: "Pro",
    growth: "Team",
    pro: "Scale",
  };
  return map[plan] ?? plan;
}

/**
 * Per-plan resource and event caps.
 * Used by API routes to enforce limits on connections, projects, and event volume.
 */
export const PLAN_LIMITS = {
  free:    { connections: 1,        projects: 1,        eventsPerMonth: 50_000,    historyDays: 7   },
  starter: { connections: 10,       projects: 20,       eventsPerMonth: 1_000_000, historyDays: 365 },
  growth:  { connections: 50,       projects: 100,      eventsPerMonth: 5_000_000, historyDays: 365 },
  pro:     { connections: Infinity, projects: Infinity, eventsPerMonth: Infinity,  historyDays: 365 },
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

/**
 * Returns the maximum history window in days the plan allows.
 * Free: 7 days. All paid plans (Pro / Team / Scale): 365 days.
 */
export function getHistoryDays(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.historyDays ?? PLAN_LIMITS.free.historyDays;
}

// ---------------------------------------------------------------------------
// Feature gates
// ---------------------------------------------------------------------------

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
 * Team (growth) and Scale (pro) only — not available on Free or Pro personal tier.
 */
export function canUseThrottle(plan: string): boolean {
  return plan === "growth" || plan === "pro";
}

/**
 * Returns true if the plan supports per-user spend attribution.
 * Corporate tiers only: Team (growth) and Scale (pro).
 */
export function canUsePerUserAttribution(plan: string): boolean {
  return plan === "growth" || plan === "pro";
}

/**
 * Returns true if the plan supports team-level budget rules.
 * Corporate tiers only: Team (growth) and Scale (pro).
 */
export function canUseTeamBudgets(plan: string): boolean {
  return plan === "growth" || plan === "pro";
}

/**
 * Returns true if the plan supports exporting audit logs.
 * Scale (pro) only.
 */
export function canUseAuditExport(plan: string): boolean {
  return plan === "pro";
}

/**
 * Returns true if the plan supports SSO / SAML login.
 * Scale (pro) only.
 */
export function canUseSSO(plan: string): boolean {
  return plan === "pro";
}
