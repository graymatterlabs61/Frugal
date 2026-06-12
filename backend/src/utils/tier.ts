import type { planEnum } from "../db/schema.js";

export type Plan = (typeof planEnum.enumValues)[number];

/**
 * Plan → display name mapping
 *
 * Personal:  free → "Free" | plus → "Plus" | pro → "Pro"
 * Corporate: corp_starter → "Starter" | corp_growth → "Growth" | corp_scale → "Scale" | enterprise → "Enterprise"
 */
export interface PlanLimits {
  projects: number;
  connections: number;
  eventsPerMonth: number;
  historyDays: number;
  maxSeats: number;
  allowsBlock: boolean;
  allowsThrottle: boolean;
  allowsPerUserAttribution: boolean;
  allowsTeamBudgets: boolean;
  allowsAuditExport: boolean;
  allowsSSO: boolean;
  isCorporate: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    projects: 1,
    connections: 1,
    eventsPerMonth: 50_000,
    historyDays: 7,
    maxSeats: 1,
    allowsBlock: false,
    allowsThrottle: false,
    allowsPerUserAttribution: false,
    allowsTeamBudgets: false,
    allowsAuditExport: false,
    allowsSSO: false,
    isCorporate: false,
  },
  plus: {
    projects: 5,
    connections: 3,
    eventsPerMonth: 1_000_000,
    historyDays: 90,
    maxSeats: 1,
    allowsBlock: true,
    allowsThrottle: false,
    allowsPerUserAttribution: false,
    allowsTeamBudgets: false,
    allowsAuditExport: false,
    allowsSSO: false,
    isCorporate: false,
  },
  pro: {
    projects: Infinity,
    connections: Infinity,
    eventsPerMonth: Infinity,
    historyDays: 365,
    maxSeats: 1,
    allowsBlock: true,
    allowsThrottle: false,
    allowsPerUserAttribution: true,
    allowsTeamBudgets: false,
    allowsAuditExport: false,
    allowsSSO: false,
    isCorporate: false,
  },
  corp_starter: {
    projects: 50,
    connections: 25,
    eventsPerMonth: 10_000_000,
    historyDays: 365,
    maxSeats: 10,
    allowsBlock: true,
    allowsThrottle: true,
    allowsPerUserAttribution: true,
    allowsTeamBudgets: true,
    allowsAuditExport: false,
    allowsSSO: false,
    isCorporate: true,
  },
  corp_growth: {
    projects: Infinity,
    connections: Infinity,
    eventsPerMonth: 25_000_000,
    historyDays: 365,
    maxSeats: 25,
    allowsBlock: true,
    allowsThrottle: true,
    allowsPerUserAttribution: true,
    allowsTeamBudgets: true,
    allowsAuditExport: false,
    allowsSSO: false,
    isCorporate: true,
  },
  corp_scale: {
    projects: Infinity,
    connections: Infinity,
    eventsPerMonth: Infinity,
    historyDays: 365,
    maxSeats: 100,
    allowsBlock: true,
    allowsThrottle: true,
    allowsPerUserAttribution: true,
    allowsTeamBudgets: true,
    allowsAuditExport: true,
    allowsSSO: true,
    isCorporate: true,
  },
  enterprise: {
    projects: Infinity,
    connections: Infinity,
    eventsPerMonth: Infinity,
    historyDays: Infinity,
    maxSeats: Infinity,
    allowsBlock: true,
    allowsThrottle: true,
    allowsPerUserAttribution: true,
    allowsTeamBudgets: true,
    allowsAuditExport: true,
    allowsSSO: true,
    isCorporate: true,
  },
};

export const PLAN_DISPLAY_NAMES: Record<Plan, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
  corp_starter: "Starter",
  corp_growth: "Growth",
  corp_scale: "Scale",
  enterprise: "Enterprise",
};
