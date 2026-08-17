import { sql, eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usageRecords, ingestEvents, apiConnections } from '../db/schema.js';

export const SpendRepository = {
  /** Sum of polled usage + ingested events for a project, inclusive date range (YYYY-MM-DD). */
  async sumForProject(projectId: string, fromDate: string, toDate: string): Promise<number> {
    const [usageRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(${usageRecords.costUsd}), 0)` })
      .from(usageRecords)
      .innerJoin(apiConnections, eq(usageRecords.connectionId, apiConnections.id))
      .where(
        and(
          eq(apiConnections.projectId, projectId),
          gte(usageRecords.date, fromDate),
          lte(usageRecords.date, toDate),
        ),
      );

    const [ingestRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(${ingestEvents.costUsd}), 0)` })
      .from(ingestEvents)
      .where(
        and(
          eq(ingestEvents.projectId, projectId),
          gte(sql`${ingestEvents.createdAt}::date`, fromDate),
          lte(sql`${ingestEvents.createdAt}::date`, toDate),
        ),
      );

    return Number(usageRow?.total ?? 0) + Number(ingestRow?.total ?? 0);
  },
};
