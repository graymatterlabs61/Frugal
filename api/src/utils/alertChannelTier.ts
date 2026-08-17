import { isPlanTier, type PlanTier } from './tier.js';

export type AlertChannel = 'email' | 'slack' | 'webhook';

/** Per spec §4's Alerts row: Free=Email, Plus=+Slack, Pro/corp/enterprise=+Webhook. */
const ALERT_CHANNELS: Record<PlanTier, ReadonlyArray<AlertChannel>> = {
  free: ['email'],
  plus: ['email', 'slack'],
  pro: ['email', 'slack', 'webhook'],
  corp_starter: ['email', 'slack', 'webhook'],
  corp_growth: ['email', 'slack', 'webhook'],
  corp_scale: ['email', 'slack', 'webhook'],
  enterprise: ['email', 'slack', 'webhook'],
};

/** Unknown/undefined plans fall back to the `free` tier's channels (fail safe — email only). */
export function alertChannelsFor(plan: string | undefined): ReadonlyArray<AlertChannel> {
  const tier: PlanTier = plan !== undefined && isPlanTier(plan) ? plan : 'free';
  return ALERT_CHANNELS[tier];
}
