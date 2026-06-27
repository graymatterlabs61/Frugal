import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { usageRecords, projects, apiConnections, type NewUsageRecord } from '@/db/schema';

export class UsageRepository {
  async upsert(data: NewUsageRecord): Promise<void> {
    await db
      .insert(usageRecords)
      .values(data)
      .onConflictDoUpdate({
        target: [usageRecords.connectionId, usageRecords.date, usageRecords.model],
        set: {
          tokensInput: data.tokensInput,
          tokensOutput: data.tokensOutput,
          costUsd: data.costUsd,
          rawResponse: data.rawResponse,
        },
      });
  }

  async getTotalSpendByProject(
    userId: string,
    projectId: string,
    since: Date,
  ): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .where(
        and(
          eq(apiConnections.projectId, projectId),
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, since.toISOString().split('T')[0]),
        ),
      );
    return parseFloat(result[0]?.total ?? '0');
  }

  async getSpendChart(
    userId: string,
    days: number,
  ): Promise<{ date: string; costUsd: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({
        date: usageRecords.date,
        costUsd: sql<string>`SUM(${usageRecords.costUsd})`,
      })
      .from(usageRecords)
      .where(
        and(
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, since.toISOString().split('T')[0]),
        ),
      )
      .groupBy(usageRecords.date)
      .orderBy(usageRecords.date);

    return rows.map((r) => ({ date: r.date, costUsd: parseFloat(r.costUsd ?? '0') }));
  }

  async getTopProjects(
    userId: string,
    days: number,
    limit = 5,
  ): Promise<{ projectId: string; projectName: string; costUsd: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        costUsd: sql<string>`SUM(${usageRecords.costUsd})`,
      })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .innerJoin(projects, eq(apiConnections.projectId, projects.id))
      .where(
        and(
          eq(usageRecords.userId, userId),
          gte(usageRecords.date, since.toISOString().split('T')[0]),
        ),
      )
      .groupBy(projects.id, projects.name)
      .orderBy(desc(sql`SUM(${usageRecords.costUsd})`))
      .limit(limit);

    return rows.map((r) => ({
      projectId: r.projectId,
      projectName: r.projectName,
      costUsd: parseFloat(r.costUsd ?? '0'),
    }));
  }

  async getDashboardSummary(userId: string): Promise<{
    totalSpendToday: number;
    totalSpendThisMonth: number;
    totalSpend30Days: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [todayRow, monthRow, thirtyRow] = await Promise.all([
      db
        .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
        .from(usageRecords)
        .where(and(eq(usageRecords.userId, userId), eq(usageRecords.date, today))),
      db
        .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
        .from(usageRecords)
        .where(
          and(
            eq(usageRecords.userId, userId),
            gte(usageRecords.date, firstOfMonth.toISOString().split('T')[0]),
          ),
        ),
      db
        .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
        .from(usageRecords)
        .where(
          and(
            eq(usageRecords.userId, userId),
            gte(usageRecords.date, thirtyDaysAgo.toISOString().split('T')[0]),
          ),
        ),
    ]);

    return {
      totalSpendToday: parseFloat(todayRow[0]?.total ?? '0'),
      totalSpendThisMonth: parseFloat(monthRow[0]?.total ?? '0'),
      totalSpend30Days: parseFloat(thirtyRow[0]?.total ?? '0'),
    };
  }
}