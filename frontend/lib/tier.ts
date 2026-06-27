export type Plan =
  | "free"
  | "plus"
  | "pro"
  | "corp_starter"
  | "corp_growth"
  | "corp_scale"
  | "enterprise";

export function getPlanDisplayName(plan: string): string {
  const map: Record<string, string> = {
    free: "Free",
    plus: "Plus",
    pro: "Pro",
    corp_starter: "Starter",
    corp_growth: "Growth",
    corp_scale: "Scale",
    enterprise: "Enterprise",
  };
  return map[plan] ?? plan;
}

export const PLAN_LIMITS = {
  free:         { connections: 1,        projects: 1,        historyDays: 7   },
  plus:         { connections: 3,        projects: 5,        historyDays: 90  },
  pro:          { connections: Infinity, projects: Infinity, historyDays: 365 },
  corp_starter: { connections: Infinity, projects: Infinity, historyDays: 365 },
  corp_growth:  { connections: Infinity, projects: Infinity, historyDays: 365 },
  corp_scale:   { connections: Infinity, projects: Infinity, historyDays: 365 },
  enterprise:   { connections: Infinity, projects: Infinity, historyDays: 365 },
} as const;

export function getConnectionLimit(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.connections ?? PLAN_LIMITS.free.connections;
}

export function getProjectLimit(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.projects ?? PLAN_LIMITS.free.projects;
}

export function getHistoryDays(plan: string): number {
  const key = plan as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[key]?.historyDays ?? PLAN_LIMITS.free.historyDays;
}

export function canCreateBudgetRules(plan: string): boolean {
  return plan !== "free";
}

export function canUseBlock(plan: string): boolean {
  return plan !== "free";
}

export function canUseThrottle(plan: string): boolean {
  return (
    plan === "corp_starter" ||
    plan === "corp_growth" ||
    plan === "corp_scale" ||
    plan === "enterprise"
  );
}

export function canUsePerUserAttribution(plan: string): boolean {
  return plan === "pro" || plan.startsWith("corp_") || plan === "enterprise";
}

export function canUseTeamBudgets(plan: string): boolean {
  return plan.startsWith("corp_") || plan === "enterprise";
}

export function canUseAuditExport(plan: string): boolean {
  return plan === "corp_scale" || plan === "enterprise";
}

export function canUseSSO(plan: string): boolean {
  return plan === "corp_scale" || plan === "enterprise";
}