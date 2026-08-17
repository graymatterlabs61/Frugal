import { eq, and, gte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { alertLog, type AlertStatus } from '../db/schema.js';

export const AlertRepository = {
  async listForUser(userId: string) {
    return db.select().from(alertLog).where(eq(alertLog.userId, userId));
  },

  async update(id: string, userId: string, status: AlertStatus) {
    const [row] = await db
      .update(alertLog)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      })
      .where(and(eq(alertLog.id, id), eq(alertLog.userId, userId)))
      .returning();
    return row;
  },

  /** System-side (not user-scoped) — budgetChecker's dedup check: has this rule already alerted recently? */
  async findRecentForRule(ruleId: string, since: Date) {
    const [row] = await db
      .select()
      .from(alertLog)
      .where(and(eq(alertLog.ruleId, ruleId), gte(alertLog.triggeredAt, since)))
      .limit(1);
    return row;
  },

  /** System-side — budgetChecker writes the triggered alert; no HTTP endpoint creates these. */
  async create(data: {
    projectId: string;
    userId: string;
    ruleId: string;
    spendAtTrigger: number;
    limitUsd: number;
    actionTaken: string;
  }) {
    const [row] = await db
      .insert(alertLog)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        ruleId: data.ruleId,
        spendAtTrigger: data.spendAtTrigger.toFixed(2),
        limitUsd: data.limitUsd.toFixed(2),
        actionTaken: data.actionTaken,
      })
      .returning();
    return row!;
  },

  /** System-side — alertDispatcher records which channels succeeded after `create`. */
  async recordDelivery(
    id: string,
    notifiedVia: string[],
    deliveryStatus: Record<string, unknown>,
  ): Promise<void> {
    await db.update(alertLog).set({ notifiedVia, deliveryStatus }).where(eq(alertLog.id, id));
  },
};
