export type PlanTier =
  | 'free'
  | 'plus'
  | 'pro'
  | 'corp_starter'
  | 'corp_growth'
  | 'corp_scale'
  | 'enterprise';

const PLAN_LIMITS: Record<PlanTier, { projects: number; connections: number }> = {
  free: { projects: 1, connections: 1 },
  plus: { projects: 5, connections: 3 },
  pro: { projects: Infinity, connections: Infinity },
  corp_starter: { projects: Infinity, connections: Infinity },
  corp_growth: { projects: Infinity, connections: Infinity },
  corp_scale: { projects: Infinity, connections: Infinity },
  enterprise: { projects: Infinity, connections: Infinity },
};

function isPlanTier(value: string): value is PlanTier {
  return value in PLAN_LIMITS;
}

/** Unknown/undefined plans fall back to the `free` tier's limits (fail safe). */
export function limitFor(plan: string | undefined, resource: 'projects' | 'connections'): number {
  const tier: PlanTier = plan !== undefined && isPlanTier(plan) ? plan : 'free';
  return PLAN_LIMITS[tier][resource];
}
