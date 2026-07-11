import { isPlanTier, type PlanTier } from './tier.js';

const ALLOWED_ACTIONS: Record<PlanTier, ReadonlyArray<'alert' | 'block' | 'throttle'>> = {
  free: [],
  plus: ['alert', 'block'],
  pro: ['alert', 'block'],
  corp_starter: ['alert', 'block', 'throttle'],
  corp_growth: ['alert', 'block', 'throttle'],
  corp_scale: ['alert', 'block', 'throttle'],
  enterprise: ['alert', 'block', 'throttle'],
};

/** Unknown/undefined plans fall back to the `free` tier's allowed actions (fail safe — none). */
export function isActionAllowed(
  plan: string | undefined,
  action: 'alert' | 'block' | 'throttle',
): boolean {
  const tier: PlanTier = plan !== undefined && isPlanTier(plan) ? plan : 'free';
  return ALLOWED_ACTIONS[tier].includes(action);
}
