import { ForbiddenError } from './errors';

export type Plan =
  | 'free'
  | 'plus'
  | 'pro'
  | 'corp_starter'
  | 'corp_growth'
  | 'corp_scale'
  | 'enterprise';

export interface PlanLimits {
  maxProjects: number;
  maxConnections: number;
  historyDays: number;
  maxEventsPerMonth: number;
  canBlock: boolean;
  alertChannels: ('email' | 'slack' | 'webhook')[];
  perUserAttribution: boolean;
  programmaticApi: boolean;
  isCorporate: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxConnections: 1,
    historyDays: 7,
    maxEventsPerMonth: 50_000,
    canBlock: false,
    alertChannels: ['email'],
    perUserAttribution: false,
    programmaticApi: false,
    isCorporate: false,
  },
  plus: {
    maxProjects: 5,
    maxConnections: 3,
    historyDays: 90,
    maxEventsPerMonth: 1_000_000,
    canBlock: true,
    alertChannels: ['email', 'slack'],
    perUserAttribution: false,
    programmaticApi: false,
    isCorporate: false,
  },
  pro: {
    maxProjects: Infinity,
    maxConnections: Infinity,
    historyDays: 365,
    maxEventsPerMonth: Infinity,
    canBlock: true,
    alertChannels: ['email', 'slack', 'webhook'],
    perUserAttribution: true,
    programmaticApi: true,
    isCorporate: false,
  },
  corp_starter: {
    maxProjects: Infinity,
    maxConnections: Infinity,
    historyDays: 365,
    maxEventsPerMonth: Infinity,
    canBlock: true,
    alertChannels: ['email', 'slack', 'webhook'],
    perUserAttribution: true,
    programmaticApi: true,
    isCorporate: true,
  },
  corp_growth: {
    maxProjects: Infinity,
    maxConnections: Infinity,
    historyDays: 365,
    maxEventsPerMonth: Infinity,
    canBlock: true,
    alertChannels: ['email', 'slack', 'webhook'],
    perUserAttribution: true,
    programmaticApi: true,
    isCorporate: true,
  },
  corp_scale: {
    maxProjects: Infinity,
    maxConnections: Infinity,
    historyDays: 365,
    maxEventsPerMonth: Infinity,
    canBlock: true,
    alertChannels: ['email', 'slack', 'webhook'],
    perUserAttribution: true,
    programmaticApi: true,
    isCorporate: true,
  },
  enterprise: {
    maxProjects: Infinity,
    maxConnections: Infinity,
    historyDays: 365,
    maxEventsPerMonth: Infinity,
    canBlock: true,
    alertChannels: ['email', 'slack', 'webhook'],
    perUserAttribution: true,
    programmaticApi: true,
    isCorporate: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function requireCorporate(plan: Plan): void {
  if (!PLAN_LIMITS[plan].isCorporate) {
    throw new ForbiddenError('Corporate plan required');
  }
}

export function requirePro(plan: Plan): void {
  if (!PLAN_LIMITS[plan].programmaticApi) {
    throw new ForbiddenError('Pro plan or higher required');
  }
}

export function requirePlanFeature(plan: Plan, feature: keyof PlanLimits): void {
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  if (!value || (typeof value === 'number' && value === 0)) {
    throw new ForbiddenError(`Your plan does not support this feature`);
  }
}