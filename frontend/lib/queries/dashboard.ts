import { apiClient } from "@/lib/api";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  monthlySpend: number;
  activeProjects: number;
  connectionCount: number;
  alertCount: number;
}

export interface SpendRow {
  date: string; // "YYYY-MM-DD"
  openai: number;
  anthropic: number;
  replicate: number;
  falai: number;
  gemini: number;
  groq: number;
  mistral: number;
  [key: string]: number | string;
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
  status?: string;
  monthlySpend: number;
  burnRateDaily: number;
  projectedMonthly: number;
  budgetLimit: number | null;
  lastUpdatedAt: string | null;
  slackWebhookUrl: string | null;
}

export interface ProjectConnection {
  id: string;
  provider: string;
  apiKeySuffix: string;
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
// getDashboardStats
// ---------------------------------------------------------------------------

export async function getDashboardStats(
  userId: string,
  token?: string,
): Promise<DashboardStats> {
  try {
    const data = await apiClient.get<DashboardStats>(
      `/api/dashboard/stats?userId=${userId}`,
      token,
    );
    return data;
  } catch {
    console.error("[getDashboardStats] request failed");
    return { monthlySpend: 0, activeProjects: 0, connectionCount: 0, alertCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// getDailySpend
// ---------------------------------------------------------------------------

export async function getDailySpend(
  userId: string,
  days: number,
  token?: string,
): Promise<SpendRow[]> {
  try {
    const data = await apiClient.get<{ rows: SpendRow[] }>(
      `/api/dashboard/daily-spend?userId=${userId}&days=${days}`,
      token,
    );
    return data.rows ?? [];
  } catch {
    console.error("[getDailySpend] request failed");
    return [];
  }
}

// ---------------------------------------------------------------------------
// getTopProjects
// ---------------------------------------------------------------------------

export async function getTopProjects(
  userId: string,
  token?: string,
): Promise<TopProject[]> {
  try {
    const data = await apiClient.get<{ projects: TopProject[] }>(
      `/api/dashboard/top-projects?userId=${userId}`,
      token,
    );
    return data.projects ?? [];
  } catch {
    console.error("[getTopProjects] request failed");
    return [];
  }
}

// ---------------------------------------------------------------------------
// getRecentAlerts
// ---------------------------------------------------------------------------

export async function getRecentAlerts(
  userId: string,
  limit = 5,
  token?: string,
): Promise<RecentAlert[]> {
  try {
    const data = await apiClient.get<{ alerts: RecentAlert[] }>(
      `/api/dashboard/recent-alerts?userId=${userId}&limit=${limit}`,
      token,
    );
    return data.alerts ?? [];
  } catch {
    console.error("[getRecentAlerts] request failed");
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjectStats
// ---------------------------------------------------------------------------

export async function getProjectStats(
  userId: string,
  projectId: string,
  token?: string,
): Promise<ProjectStats | null> {
  try {
    const data = await apiClient.get<ProjectStats>(
      `/api/projects/${projectId}/stats?userId=${userId}`,
      token,
    );
    return data;
  } catch {
    console.error("[getProjectStats] request failed");
    return null;
  }
}

// ---------------------------------------------------------------------------
// getProjectConnections
// ---------------------------------------------------------------------------

export async function getProjectConnections(
  userId: string,
  projectId: string,
  token?: string,
): Promise<ProjectConnection[]> {
  try {
    const data = await apiClient.get<{ connections: ProjectConnection[] }>(
      `/api/projects/${projectId}/connections?userId=${userId}`,
      token,
    );
    return data.connections ?? [];
  } catch {
    console.error("[getProjectConnections] request failed");
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjectAlerts
// ---------------------------------------------------------------------------

export async function getProjectAlerts(
  userId: string,
  projectId: string,
  limit = 20,
  token?: string,
): Promise<ProjectAlert[]> {
  try {
    const data = await apiClient.get<{ alerts: ProjectAlert[] }>(
      `/api/projects/${projectId}/alerts?userId=${userId}&limit=${limit}`,
      token,
    );
    return data.alerts ?? [];
  } catch {
    console.error("[getProjectAlerts] request failed");
    return [];
  }
}
