import { apiClient } from "@/lib/api";

// ---------------------------------------------------------------------------
// Backend response shapes
// ---------------------------------------------------------------------------

interface BackendAlert {
  id: string;
  projectId: string;
  triggeredAt: string;
  spendAtTrigger: string;
  limitUsd: string;
  percentUsed: string | null;
  actionTaken: string | null;
  status: "active" | "acknowledged" | "resolved";
}

interface BackendProject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  slackWebhookUrl: string | null;
  customWebhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendConnection {
  id: string;
  projectId: string;
  provider: string;
  label: string | null;
  apiKeySuffix: string | null;
  status: string;
  lastPolledAt: string | null;
}

// ---------------------------------------------------------------------------
// Frontend types
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  totalSpendToday: number;
  totalSpendThisMonth: number;
  totalSpend30Days: number;
}

export interface SpendRow {
  date: string;
  costUsd: number;
}

export interface TopProject {
  id: string;
  name: string;
  monthlySpend: number;
  budgetLimit: number | null;
}

export interface RecentAlert {
  id: string;
  firedAt: string;
  message: string;
  type: string;
  severity: "critical" | "warning" | "info";
  status: "active" | "resolved" | "acknowledged";
}

export interface ProjectStats {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  slackWebhookUrl: string | null;
  customWebhookUrl: string | null;
  monthlySpend: number;
  burnRateDaily: number;
  projectedMonthly: number;
  budgetLimit: number | null;
  status?: string;
}

export interface ProjectConnection {
  id: string;
  provider: string;
  apiKeySuffix: string | null;
  status: string;
  lastPolledAt: string | null;
}

export interface ProjectAlert {
  id: string;
  firedAt: string;
  severity: "critical" | "warning" | "info";
  message: string;
  status: "active" | "resolved" | "acknowledged";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapAlertSeverity(
  percentUsed: string | null,
  spendAtTrigger?: string,
  limitUsd?: string,
): "critical" | "warning" | "info" {
  let pct = parseFloat(percentUsed ?? "0");
  if (!pct && spendAtTrigger && limitUsd) {
    const limit = parseFloat(limitUsd);
    if (limit > 0) pct = (parseFloat(spendAtTrigger) / limit) * 100;
  }
  if (pct >= 100) return "critical";
  if (pct >= 80) return "warning";
  return "info";
}

function mapAlertMessage(
  spendAtTrigger: string,
  limitUsd: string,
  percentUsed: string | null,
): string {
  const spend = parseFloat(spendAtTrigger);
  const limit = parseFloat(limitUsd);
  const pct = percentUsed
    ? parseFloat(percentUsed)
    : limit > 0
    ? Math.round((spend / limit) * 100)
    : 0;
  return `Spend $${spend.toFixed(2)} hit ${pct.toFixed(0)}% of $${limit.toFixed(2)} budget`;
}

function mapBackendAlert(a: BackendAlert): RecentAlert {
  return {
    id: a.id,
    firedAt: a.triggeredAt,
    type: a.actionTaken ?? "alert",
    message: mapAlertMessage(a.spendAtTrigger, a.limitUsd, a.percentUsed),
    severity: mapAlertSeverity(a.percentUsed, a.spendAtTrigger, a.limitUsd),
    status: a.status,
  };
}

// ---------------------------------------------------------------------------
// getDashboardSummary — GET /api/v1/dashboard
// ---------------------------------------------------------------------------

export async function getDashboardSummary(token?: string): Promise<DashboardSummary> {
  try {
    const data = await apiClient.get<DashboardSummary>("/api/v1/dashboard", token);
    return {
      totalSpendToday: data.totalSpendToday ?? 0,
      totalSpendThisMonth: data.totalSpendThisMonth ?? 0,
      totalSpend30Days: data.totalSpend30Days ?? 0,
    };
  } catch {
    return { totalSpendToday: 0, totalSpendThisMonth: 0, totalSpend30Days: 0 };
  }
}

// ---------------------------------------------------------------------------
// getSpendChart — GET /api/v1/dashboard/spend-chart?days=N
// ---------------------------------------------------------------------------

export async function getSpendChart(days: number, token?: string): Promise<SpendRow[]> {
  try {
    const data = await apiClient.get<{ chart: Array<{ date: string; costUsd: string }> }>(
      `/api/v1/dashboard/spend-chart?days=${days}`,
      token,
    );
    return (data.chart ?? []).map((r) => ({
      date: r.date,
      costUsd: parseFloat(r.costUsd) || 0,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getTopProjects — GET /api/v1/dashboard/top-projects?days=N
// ---------------------------------------------------------------------------

export async function getTopProjects(days: number, token?: string): Promise<TopProject[]> {
  try {
    const data = await apiClient.get<{
      projects: Array<{ projectId: string; projectName: string; costUsd: string }>;
    }>(`/api/v1/dashboard/top-projects?days=${days}`, token);
    return (data.projects ?? []).map((p) => ({
      id: p.projectId,
      name: p.projectName,
      monthlySpend: parseFloat(p.costUsd) || 0,
      budgetLimit: null,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getRecentAlerts — GET /api/v1/alerts (sliced client-side)
// ---------------------------------------------------------------------------

export async function getRecentAlerts(
  limit: number,
  token?: string,
): Promise<RecentAlert[]> {
  try {
    const data = await apiClient.get<{ alerts: BackendAlert[] }>("/api/v1/alerts", token);
    return (data.alerts ?? []).slice(0, limit).map(mapBackendAlert);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjects — GET /api/v1/projects
// ---------------------------------------------------------------------------

export async function getProjects(token?: string): Promise<BackendProject[]> {
  try {
    const data = await apiClient.get<{ projects: BackendProject[] }>("/api/v1/projects", token);
    return data.projects ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getConnections — GET /api/v1/connections
// ---------------------------------------------------------------------------

export async function getConnections(token?: string): Promise<BackendConnection[]> {
  try {
    const data = await apiClient.get<{ connections: BackendConnection[] }>(
      "/api/v1/connections",
      token,
    );
    return data.connections ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjectStats — GET /api/v1/projects/:id
// ---------------------------------------------------------------------------

export async function getProjectStats(
  projectId: string,
  token?: string,
): Promise<ProjectStats | null> {
  try {
    const data = await apiClient.get<{ project: BackendProject }>(
      `/api/v1/projects/${projectId}`,
      token,
    );
    if (!data.project) return null;
    const p = data.project;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      slackWebhookUrl: p.slackWebhookUrl,
      customWebhookUrl: p.customWebhookUrl,
      monthlySpend: 0,
      burnRateDaily: 0,
      projectedMonthly: 0,
      budgetLimit: null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// getProjectConnections — GET /api/v1/connections filtered by projectId
// ---------------------------------------------------------------------------

export async function getProjectConnections(
  projectId: string,
  token?: string,
): Promise<ProjectConnection[]> {
  try {
    const data = await apiClient.get<{ connections: BackendConnection[] }>(
      "/api/v1/connections",
      token,
    );
    return (data.connections ?? [])
      .filter((c) => c.projectId === projectId)
      .map((c) => ({
        id: c.id,
        provider: c.provider,
        apiKeySuffix: c.apiKeySuffix,
        status: c.status,
        lastPolledAt: c.lastPolledAt,
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjectAlerts — GET /api/v1/alerts filtered by projectId
// ---------------------------------------------------------------------------

export async function getProjectAlerts(
  projectId: string,
  limit: number,
  token?: string,
): Promise<ProjectAlert[]> {
  try {
    const data = await apiClient.get<{ alerts: BackendAlert[] }>("/api/v1/alerts", token);
    return (data.alerts ?? [])
      .filter((a) => a.projectId === projectId)
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        firedAt: a.triggeredAt,
        message: mapAlertMessage(a.spendAtTrigger, a.limitUsd, a.percentUsed),
        severity: mapAlertSeverity(a.percentUsed, a.spendAtTrigger, a.limitUsd),
        status: a.status,
      }));
  } catch {
    return [];
  }
}