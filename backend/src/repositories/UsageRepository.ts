import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { apiConnections, usageRecords } from "../db/schema.js";

export type UsageRow = typeof usageRecords.$inferSelect;

type UpsertUsageData = {
  connectionId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: string; // numeric as string
  rawResponse?: unknown;
};

export interface DailySpendRow {
  date: string;
  provider: string;
  totalCostUsd: string;
}

export interface MonthlySpendRow {
  totalCostUsd: string;
}

export class UsageRepository {
  constructor(private readonly db: Db) {}

  /**
   * Upsert a daily usage record. Unique key: (connectionId, date, model).
   * On conflict, sums tokens and cost (idempotent for repeated polling cycles).
   */
  async upsertDailyRecord(data: UpsertUsageData): Promise<UsageRow> {
    const rows = await this.db
      .insert(usageRecords)
      .values({
        connectionId: data.connectionId,
        userId: data.userId,
        date: data.date,
        model: data.model,
        tokensInput: data.tokensInput,
        tokensOutput: data.tokensOutput,
        costUsd: data.costUsd,
        rawResponse: data.rawResponse ?? null,
      })
      .onConflictDoUpdate({
        target: [usageRecords.connectionId, usageRecords.date, usageRecords.model],
        set: {
          tokensInput: data.tokensInput,
          tokensOutput: data.tokensOutput,
          costUsd: data.costUsd,
          rawResponse: data.rawResponse ?? null,
        },
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to upsert usage record");
    return row;
  }

  /**
   * Aggregated daily spend by provider for chart display.
   * Scoped to userId.
   */
  async getDailySpendByUser(
    userId: string,
    fromDate: string,
    toDate: string
  ): Promise<DailySpendRow[]> {
    const rows = await this.db
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

    return rows.map((r) => ({
      date: r.date,
      provider: r.provider,
      totalCostUsd: r.totalCostUsd,
    }));
  }

  /**
   * Monthly spend for a specific project.
   * month is the first day of the month, e.g. "2024-01-01".
   */
  async getMonthlySpendByProject(
    userId: string,
    projectId: string,
    fromDate: string,
    toDate: string
  ): Promise<string> {
    const rows = await this.db
      .select({
        totalCostUsd: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), '0')`,
      })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .where(
        and(
          eq(usageRecords.userId, userId),
          eq(apiConnections.projectId, projectId),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate)
        )
      );
    return rows[0]?.totalCostUsd ?? "0";
  }

  /** Monthly spend for a user across all projects. */
  async getMonthlySpendByUser(
    userId: string,
    fromDate: string,
    toDate: string
  ): Promise<string> {
    const rows = await this.db
      .select({
        totalCostUsd: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), '0')`,
      })
      .from(usageRecords)
      .where(
        and(
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate)
        )
      );
    return rows[0]?.totalCostUsd ?? "0";
  }
}
