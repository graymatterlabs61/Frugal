import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import type { Db } from "../db/index.js";
import {
  alertLog,
  apiConnections,
  budgetRules,
  projects,
  usageRecords,
} from "../db/schema.js";

export interface DashboardStats {
  monthlySpend: number;
  activeProjects: number;
  connectionCount: number;
  alertCount: number;
}

export interface SpendRow {
  date: string;
  openai: number;
  anthropic: number;
  replicate: number;
  falai: number;
  gemini: number;
  groq: number;
  mistral: number;
  together: number;
  cohere: number;
  perplexity: number;
  deepseek: number;
  stability: number;
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

const ALL_PROVIDERS = [
  "openai", "anthropic", "replicate", "falai", "gemini",
  "groq", "mistral", "together", "cohere", "perplexity", "deepseek", "stability",
] as const;

export class DashboardRepository {
  constructor(private readonly db: Db) {}

  async getStats(userId: string, fromDate: string, toDate: string): Promise<DashboardStats> {
    const [spendRow, projectRow, connectionRow, alertRow] = await Promise.all([
      this.db
        .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), '0')` })
        .from(usageRecords)
        .where(
          and(
            eq(usageRecords.userId, userId),
            gte(usageRecords.date, fromDate),
            lte(usageRecords.date, toDate)
          )
        ),
      this.db
        .select({ cnt: count() })
        .from(projects)
        .where(eq(projects.userId, userId)),
      this.db
        .select({ cnt: count() })
        .from(apiConnections)
        .where(and(eq(apiConnections.userId, userId), eq(apiConnections.isActive, true))),
      this.db
        .select({ cnt: count() })
        .from(alertLog)
        .where(and(eq(alertLog.userId, userId), eq(alertLog.status, "active"))),
    ]);

    return {
      monthlySpend: parseFloat(spendRow[0]?.total ?? "0"),
      activeProjects: projectRow[0]?.cnt ?? 0,
      connectionCount: connectionRow[0]?.cnt ?? 0,
      alertCount: alertRow[0]?.cnt ?? 0,
    };
  }

  async getDailySpend(userId: string, fromDate: string, toDate: string): Promise<SpendRow[]> {
    const rawRows = await this.db
      .select({
        date: usageRecords.date,
        provider: apiConnections.provider,
        totalCostUsd: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), '0')`,
      })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .where(
        and(
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate)
        )
      )
      .groupBy(usageRecords.date, apiConnections.provider)
      .orderBy(usageRecords.date);

    // Pivot into one row per date
    const byDate = new Map<string, SpendRow>();
    for (const row of rawRows) {
      if (!byDate.has(row.date)) {
        byDate.set(row.date, {
          date: row.date,
          openai: 0, anthropic: 0, replicate: 0, falai: 0, gemini: 0,
          groq: 0, mistral: 0, together: 0, cohere: 0, perplexity: 0,
          deepseek: 0, stability: 0,
        });
      }
      const entry = byDate.get(row.date)!;
      if (ALL_PROVIDERS.includes(row.provider as typeof ALL_PROVIDERS[number])) {
        (entry as unknown as Record<string, number | string>)[row.provider] = parseFloat(row.totalCostUsd);
      }
    }

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProjects(
    userId: string,
    fromDate: string,
    toDate: string,
    limit = 5
  ): Promise<TopProject[]> {
    const spendRows = await this.db
      .select({
        projectId: apiConnections.projectId,
        totalSpend: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), '0')`,
      })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .where(
        and(
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate),
          sql`${apiConnections.projectId} IS NOT NULL`
        )
      )
      .groupBy(apiConnections.projectId)
      .orderBy(desc(sql`SUM(${usageRecords.costUsd})`))
      .limit(limit);

    if (spendRows.length === 0) return [];

    const projectIds = spendRows
      .map((r) => r.projectId)
      .filter((id): id is string => id !== null);

    const [projectRows, budgetRows] = await Promise.all([
      this.db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.userId, userId), sql`${projects.id} = ANY(${projectIds})`)),
      this.db
        .select({
          projectId: budgetRules.projectId,
          limitUsd: sum(budgetRules.limitUsd),
        })
        .from(budgetRules)
        .where(
          and(
            eq(budgetRules.userId, userId),
            sql`${budgetRules.projectId} = ANY(${projectIds})`,
            eq(budgetRules.isActive, true),
            eq(budgetRules.budgetWindow, "monthly")
          )
        )
        .groupBy(budgetRules.projectId),
    ]);

    const nameMap = new Map(projectRows.map((p) => [p.id, p.name]));
    const budgetMap = new Map(
      budgetRows.map((b) => [b.projectId, b.limitUsd ? parseFloat(b.limitUsd) : null])
    );

    return spendRows
      .filter((r) => r.projectId !== null)
      .map((r) => ({
        id: r.projectId as string,
        name: nameMap.get(r.projectId as string) ?? "Unknown",
        monthlySpend: parseFloat(r.totalSpend),
        budgetLimit: budgetMap.get(r.projectId as string) ?? null,
      }));
  }

  async getRecentAlerts(userId: string, limit = 5): Promise<RecentAlert[]> {
    const rows = await this.db
      .select({
        id: alertLog.id,
        triggeredAt: alertLog.triggeredAt,
        spendAtTrigger: alertLog.spendAtTrigger,
        limitUsd: alertLog.limitUsd,
        percentUsed: alertLog.percentUsed,
        status: alertLog.status,
        projectName: projects.name,
        budgetWindow: budgetRules.budgetWindow,
      })
      .from(alertLog)
      .leftJoin(projects, eq(alertLog.projectId, projects.id))
      .leftJoin(budgetRules, eq(alertLog.ruleId, budgetRules.id))
      .where(eq(alertLog.userId, userId))
      .orderBy(desc(alertLog.triggeredAt))
      .limit(limit);

    return rows.map((r) => {
      const pct = r.percentUsed ? parseFloat(r.percentUsed) : 0;
      const severity: "critical" | "warning" | "info" =
        pct >= 100 ? "critical" : pct >= 80 ? "warning" : "info";
      const type = pct >= 100 ? "Budget Exceeded" : "Budget Warning";
      const windowLabel = r.budgetWindow === "daily" ? "daily" : "monthly";
      const limitStr = r.limitUsd ? `$${parseFloat(r.limitUsd).toFixed(2)}` : "–";
      const message = `${r.projectName ?? "Unknown project"} reached ${Math.round(pct)}% of ${limitStr} ${windowLabel} budget`;

      return {
        id: r.id,
        firedAt: r.triggeredAt.toISOString(),
        message,
        type,
        severity,
        status: r.status as RecentAlert["status"],
      };
    });
  }
}
