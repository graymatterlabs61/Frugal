import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  monthlySpend: number; // sum of cost_usd for current calendar month
  activeProjects: number; // count of projects with status='active'
  connectionCount: number; // total api_connections count (any status)
  alertCount: number; // count of alert_log rows fired this calendar month
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
  budgetLimit: number | null; // from budget_rules, null if no rule
}

export interface RecentAlert {
  id: string;
  firedAt: string; // ISO timestamp
  message: string; // computed
  type: string; // computed from action_taken
  severity: "critical" | "warning" | "info"; // computed from percent_used
  status: "active" | "resolved" | "acknowledged";
}

export interface ProjectStats {
  id: string;
  name: string;
  description: string | null;
  status: string;
  monthlySpend: number;
  burnRateDaily: number; // avg daily spend over last 7 days (sum / 7)
  projectedMonthly: number; // burnRateDaily * 30
  budgetLimit: number | null;
  lastUpdatedAt: string | null; // MAX(last_polled_at) from active connections
}

export interface ProjectConnection {
  id: string;
  provider: string;
  apiKeySuffix: string; // api_key_suffix column
  status: string;
  lastPolledAt: string | null; // ISO timestamp from last_polled_at column
}

export interface ProjectAlert {
  id: string;
  firedAt: string;
  severity: "critical" | "warning" | "info";
  message: string;
  status: "active" | "resolved" | "acknowledged";
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns the first day of the current UTC calendar month as "YYYY-MM-DD". */
function getCalMonthStart(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Returns today's date as "YYYY-MM-DD" (UTC). */
function getTodayUTC(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the date `days` ago from today as "YYYY-MM-DD" (UTC). */
function daysAgoUTC(days: number): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - days);
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Generates a complete list of date strings from startDate to endDate inclusive. */
function buildDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const current = new Date(start);
  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, "0");
    const d = String(current.getUTCDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Severity / message helpers
// ---------------------------------------------------------------------------

function computeSeverity(
  percentUsed: number,
): "critical" | "warning" | "info" {
  if (percentUsed >= 100) return "critical";
  if (percentUsed >= 80) return "warning";
  return "info";
}

function computeAlertType(actionTaken: string): string {
  return actionTaken === "block" ? "Budget Limit" : "Budget Threshold";
}

function computeAlertMessage(
  spendAtTrigger: number,
  percentUsed: number,
  limitUsd: number,
  type: string,
): string {
  return `Spend $${spendAtTrigger.toFixed(2)} reached ${percentUsed}% of $${limitUsd} ${type} rule`;
}

// ---------------------------------------------------------------------------
// getDashboardStats
// ---------------------------------------------------------------------------

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const calMonthStart = getCalMonthStart();
  const today = getTodayUTC();

  // Monthly spend across all usage_records for this user
  const { data: spendData, error: spendError } = await supabase
    .from("usage_records")
    .select("cost_usd")
    .eq("user_id", userId)
    .gte("date", calMonthStart)
    .lte("date", today);

  if (spendError) {
    console.error("[getDashboardStats] spend query error:", spendError.message);
  }

  const monthlySpend =
    spendData?.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) ?? 0;

  // Active projects count
  const { count: activeProjects, error: projectError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (projectError) {
    console.error(
      "[getDashboardStats] projects query error:",
      projectError.message,
    );
  }

  // Connection count
  const { count: connectionCount, error: connError } = await supabase
    .from("api_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (connError) {
    console.error(
      "[getDashboardStats] connections query error:",
      connError.message,
    );
  }

  // Alert count this month
  const { count: alertCount, error: alertError } = await supabase
    .from("alert_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("triggered_at", calMonthStart + "T00:00:00Z");

  if (alertError) {
    console.error(
      "[getDashboardStats] alerts query error:",
      alertError.message,
    );
  }

  return {
    monthlySpend,
    activeProjects: activeProjects ?? 0,
    connectionCount: connectionCount ?? 0,
    alertCount: alertCount ?? 0,
  };
}

// ---------------------------------------------------------------------------
// getDailySpend
// ---------------------------------------------------------------------------

interface UsageRecordWithConnection {
  date: string;
  cost_usd: number;
  api_connections:
    | { provider: string }
    | { provider: string }[]
    | null;
}

function extractProvider(
  conn: UsageRecordWithConnection["api_connections"],
): string | null {
  if (!conn) return null;
  if (Array.isArray(conn)) {
    return conn.length > 0 ? conn[0].provider : null;
  }
  return conn.provider;
}

export async function getDailySpend(
  supabase: SupabaseClient,
  userId: string,
  days: number,
): Promise<SpendRow[]> {
  const startDate = daysAgoUTC(days - 1); // inclusive: today is day 1
  const today = getTodayUTC();

  const { data, error } = await supabase
    .from("usage_records")
    .select("date, cost_usd, api_connections!inner(provider)")
    .eq("user_id", userId)
    .gte("date", startDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("[getDailySpend] query error:", error.message);
  }

  // Build skeleton with all dates, initialised to zero
  const dateList = buildDateRange(startDate, today);
  const rowMap = new Map<string, SpendRow>();
  for (const date of dateList) {
    rowMap.set(date, {
      date,
      openai: 0,
      anthropic: 0,
      replicate: 0,
      falai: 0,
      gemini: 0,
      groq: 0,
      mistral: 0,
    });
  }

  // Accumulate cost_usd per date per provider
  const records = (data ?? []) as unknown as UsageRecordWithConnection[];
  for (const record of records) {
    const dateStr = record.date;
    const provider = extractProvider(record.api_connections);
    if (!dateStr || !provider) continue;

    let row = rowMap.get(dateStr);
    if (!row) {
      // Date outside skeleton (shouldn't happen, but be safe)
      row = {
        date: dateStr,
        openai: 0,
        anthropic: 0,
        replicate: 0,
        falai: 0,
        gemini: 0,
        groq: 0,
        mistral: 0,
      };
      rowMap.set(dateStr, row);
    }

    const existing =
      typeof row[provider] === "number" ? (row[provider] as number) : 0;
    row[provider] = existing + (record.cost_usd ?? 0);
  }

  return Array.from(rowMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

// ---------------------------------------------------------------------------
// getTopProjects
// ---------------------------------------------------------------------------

export async function getTopProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<TopProject[]> {
  const { data: projectRows, error: projectError } = await supabase
    .from("project_monthly_spend")
    .select("project_id, project_name, spend_usd")
    .eq("user_id", userId)
    .order("spend_usd", { ascending: false })
    .limit(3);

  if (projectError) {
    console.error("[getTopProjects] project_monthly_spend error:", projectError.message);
    return [];
  }

  const projects = projectRows ?? [];
  if (projects.length === 0) return [];

  const projectIds = projects.map((p: { project_id: string }) => p.project_id);

  // Fetch lowest budget limit per project in a single query
  const { data: budgetRows, error: budgetError } = await supabase
    .from("budget_rules")
    .select("project_id, limit_usd")
    .in("project_id", projectIds);

  if (budgetError) {
    console.error("[getTopProjects] budget_rules error:", budgetError.message);
  }

  // Build map: project_id → minimum limit_usd
  const budgetMap = new Map<string, number>();
  for (const rule of budgetRows ?? []) {
    const existing = budgetMap.get(rule.project_id);
    if (existing === undefined || rule.limit_usd < existing) {
      budgetMap.set(rule.project_id, rule.limit_usd);
    }
  }

  return projects.map((p: { project_id: string; project_name: string; spend_usd: number }) => ({
    id: p.project_id,
    name: p.project_name,
    monthlySpend: p.spend_usd ?? 0,
    budgetLimit: budgetMap.get(p.project_id) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// getRecentAlerts
// ---------------------------------------------------------------------------

interface AlertLogRow {
  id: string;
  triggered_at: string;
  action_taken: string;
  spend_at_trigger: number;
  limit_usd: number;
  percent_used: number;
  status: string;
}

function mapAlertLogRow(
  row: AlertLogRow,
): RecentAlert {
  const type = computeAlertType(row.action_taken ?? "");
  const severity = computeSeverity(row.percent_used ?? 0);
  const message = computeAlertMessage(
    row.spend_at_trigger ?? 0,
    row.percent_used ?? 0,
    row.limit_usd ?? 0,
    type,
  );
  return {
    id: row.id,
    firedAt: row.triggered_at,
    message,
    type,
    severity,
    status: row.status as RecentAlert["status"],
  };
}

export async function getRecentAlerts(
  supabase: SupabaseClient,
  userId: string,
  limit = 5,
): Promise<RecentAlert[]> {
  const { data, error } = await supabase
    .from("alert_log")
    .select("id, triggered_at, action_taken, spend_at_trigger, limit_usd, percent_used, status")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentAlerts] query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapAlertLogRow(row as AlertLogRow));
}

// ---------------------------------------------------------------------------
// getProjectStats
// ---------------------------------------------------------------------------

export async function getProjectStats(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
): Promise<ProjectStats | null> {
  const calMonthStart = getCalMonthStart();
  const sevenDaysAgo = daysAgoUTC(7);

  // Fetch the project row
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, status")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !projectData) {
    if (projectError?.code !== "PGRST116") {
      console.error("[getProjectStats] project query error:", projectError?.message);
    }
    return null;
  }

  // Fetch connections for this project to filter usage_records by connection_id
  const { data: connections, error: connError } = await supabase
    .from("api_connections")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (connError) {
    console.error("[getProjectStats] connections query error:", connError.message);
  }

  const connectionIds = (connections ?? []).map((c: { id: string }) => c.id);

  let monthlySpend = 0;
  let burnRateDaily = 0;

  if (connectionIds.length > 0) {
    // Monthly spend: usage_records in current calendar month for these connections
    const { data: monthlyData, error: monthlyError } = await supabase
      .from("usage_records")
      .select("cost_usd")
      .in("connection_id", connectionIds)
      .eq("user_id", userId)
      .gte("date", calMonthStart);

    if (monthlyError) {
      console.error("[getProjectStats] monthly spend error:", monthlyError.message);
    }

    monthlySpend =
      (monthlyData ?? []).reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);

    // Burn rate: last 7 days divided by 7
    const { data: weekData, error: weekError } = await supabase
      .from("usage_records")
      .select("cost_usd")
      .in("connection_id", connectionIds)
      .eq("user_id", userId)
      .gte("date", sevenDaysAgo);

    if (weekError) {
      console.error("[getProjectStats] burn rate error:", weekError.message);
    }

    const weekTotal =
      (weekData ?? []).reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
    burnRateDaily = weekTotal / 7;
  }

  const projectedMonthly = burnRateDaily * 30;

  // Lowest budget limit for this project
  const { data: budgetData, error: budgetError } = await supabase
    .from("budget_rules")
    .select("limit_usd")
    .eq("project_id", projectId)
    .order("limit_usd", { ascending: true })
    .limit(1);

  if (budgetError) {
    console.error("[getProjectStats] budget_rules error:", budgetError.message);
  }

  const budgetLimit =
    budgetData && budgetData.length > 0 ? (budgetData[0].limit_usd as number) : null;

  // MAX last_polled_at from active connections
  const { data: activeConns, error: activeConnError } = await supabase
    .from("api_connections")
    .select("last_polled_at")
    .eq("project_id", projectId)
    .eq("status", "active");

  if (activeConnError) {
    console.error("[getProjectStats] active connections error:", activeConnError.message);
  }

  let lastUpdatedAt: string | null = null;
  if (activeConns && activeConns.length > 0) {
    const timestamps = activeConns
      .map((c: { last_polled_at: string | null }) => c.last_polled_at)
      .filter((t): t is string => t !== null);
    if (timestamps.length > 0) {
      lastUpdatedAt = timestamps.sort().at(-1) ?? null;
    }
  }

  return {
    id: projectData.id as string,
    name: projectData.name as string,
    description: (projectData.description as string | null) ?? null,
    status: projectData.status as string,
    monthlySpend,
    burnRateDaily,
    projectedMonthly,
    budgetLimit,
    lastUpdatedAt,
  };
}

// ---------------------------------------------------------------------------
// getProjectConnections
// ---------------------------------------------------------------------------

export async function getProjectConnections(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
): Promise<ProjectConnection[]> {
  const { data, error } = await supabase
    .from("api_connections")
    .select("id, provider, api_key_suffix, status, last_polled_at")
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.error("[getProjectConnections] query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    provider: row.provider as string,
    apiKeySuffix: (row.api_key_suffix as string) ?? "",
    status: row.status as string,
    lastPolledAt: (row.last_polled_at as string | null) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// getProjectAlerts
// ---------------------------------------------------------------------------

function mapProjectAlertRow(row: AlertLogRow): ProjectAlert {
  const type = computeAlertType(row.action_taken ?? "");
  const severity = computeSeverity(row.percent_used ?? 0);
  const message = computeAlertMessage(
    row.spend_at_trigger ?? 0,
    row.percent_used ?? 0,
    row.limit_usd ?? 0,
    type,
  );
  return {
    id: row.id,
    firedAt: row.triggered_at,
    severity,
    message,
    status: row.status as ProjectAlert["status"],
  };
}

export async function getProjectAlerts(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  limit = 20,
): Promise<ProjectAlert[]> {
  const { data, error } = await supabase
    .from("alert_log")
    .select("id, triggered_at, action_taken, spend_at_trigger, limit_usd, percent_used, status")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getProjectAlerts] query error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProjectAlertRow(row as AlertLogRow));
}
