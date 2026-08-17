import { sql, eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usageRecords, ingestEvents, apiConnections, projects, alertLog } from '../db/schema.js';

export const DashboardRepository = {
  async totalSpend(userId: string, fromDate: string, toDate: string): Promise<number> {
    const [usageRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
      .from(usageRecords)
      .where(
        and(eq(usageRecords.userId, userId), gte(usageRecords.date, fromDate), lte(usageRecords.date, toDate)),
      );

    const [ingestRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(${ingestEvents.costUsd}), 0)` })
      .from(ingestEvents)
      .where(
        and(
          eq(ingestEvents.userId, userId),
          gte(sql`${ingestEvents.createdAt}::date`, fromDate),
          lte(sql`${ingestEvents.createdAt}::date`, toDate),
        ),
      );

    return Number(usageRow?.total ?? 0) + Number(ingestRow?.total ?? 0);
  },

  async spendSeries(
    userId: string,
    fromDate: string,
    toDate: string,
  ): Promise<Array<{ date: string; costUsd: number }>> {
    const rows = await db
      .select({ date: usageRecords.date, total: sql<string>`SUM(${usageRecords.costUsd})` })
      .from(usageRecords)
      .where(
        and(eq(usageRecords.userId, userId), gte(usageRecords.date, fromDate), lte(usageRecords.date, toDate)),
      )
      .groupBy(usageRecords.date)
      .orderBy(usageRecords.date);

    return rows.map((r) => ({ date: r.date, costUsd: Number(r.total) }));
  },

  async topProjects(
    userId: string,
    fromDate: string,
    toDate: string,
    limit: number,
  ): Promise<Array<{ projectId: string; projectName: string; costUsd: number }>> {
    const rows = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)`,
      })
      .from(projects)
      .leftJoin(apiConnections, eq(apiConnections.projectId, projects.id))
      .leftJoin(
        usageRecords,
        and(
          eq(usageRecords.connectionId, apiConnections.id),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate),
        ),
      )
      .where(eq(projects.userId, userId))
      .groupBy(projects.id, projects.name);

    // Sorted/sliced in JS, not SQL — a user's project count is small even on Pro (unlimited),
    // and this avoids fragile ORDER BY on a repeated aggregate expression.
    return rows
      .map((r) => ({ projectId: r.projectId, projectName: r.projectName, costUsd: Number(r.total) }))
      .sort((a, b) => b.costUsd - a.costUsd)
      .slice(0, limit);
  },

  async activeAlertsCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: sql<string>`COUNT(*)` })
      .from(alertLog)
      .where(and(eq(alertLog.userId, userId), eq(alertLog.status, 'active')));
    return Number(row?.value ?? 0);
  },
};
