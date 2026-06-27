import { eq, and, gte } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  budgetRules,
  alertLog,
  notifications,
  type BudgetRule,
  type NewBudgetRule,
  type AlertLog,
  type Notification,
} from '@/db/schema';

export class BudgetRepository {
  async findByProject(projectId: string): Promise<BudgetRule[]> {
    return db.query.budgetRules.findMany({
      where: and(eq(budgetRules.projectId, projectId), eq(budgetRules.isActive, true)),
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<BudgetRule | undefined> {
    return db.query.budgetRules.findFirst({
      where: and(eq(budgetRules.id, id), eq(budgetRules.userId, userId)),
    });
  }

  async create(data: NewBudgetRule): Promise<BudgetRule> {
    const [rule] = await db.insert(budgetRules).values(data).returning();
    return rule;
  }

  async update(id: string, data: Partial<NewBudgetRule>): Promise<BudgetRule> {
    const [rule] = await db
      .update(budgetRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetRules.id, id))
      .returning();
    return rule;
  }

  async delete(id: string): Promise<void> {
    await db.delete(budgetRules).where(eq(budgetRules.id, id));
  }

  async findAllActiveRules(): Promise<BudgetRule[]> {
    return db.query.budgetRules.findMany({ where: eq(budgetRules.isActive, true) });
  }
}

export class AlertRepository {
  async findByUser(userId: string, limit = 50): Promise<AlertLog[]> {
    return db.query.alertLog.findMany({
      where: eq(alertLog.userId, userId),
      orderBy: (a, { desc }) => [desc(a.triggeredAt)],
      limit,
    });
  }

  async findById(id: string): Promise<AlertLog | undefined> {
    return db.query.alertLog.findFirst({ where: eq(alertLog.id, id) });
  }

  async create(data: {
    projectId: string;
    userId: string;
    ruleId: string | null;
    spendAtTrigger: string;
    limitUsd: string;
    actionTaken: string;
    notifiedVia: string[];
  }): Promise<AlertLog> {
    const [alert] = await db
      .insert(alertLog)
      .values({
        ...data,
        status: 'active',
      })
      .returning();
    return alert;
  }

  async update(id: string, data: Partial<typeof alertLog.$inferInsert>): Promise<AlertLog> {
    const [alert] = await db
      .update(alertLog)
      .set(data)
      .where(eq(alertLog.id, id))
      .returning();
    return alert;
  }

  async hasRecentAlert(
    projectId: string,
    ruleId: string,
    windowMs: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - windowMs);
    const rows = await db.query.alertLog.findMany({
      where: and(
        eq(alertLog.projectId, projectId),
        eq(alertLog.ruleId, ruleId),
        gte(alertLog.triggeredAt, since),
      ),
      limit: 1,
    });
    return rows.length > 0;
  }
}

export class NotificationRepository {
  async findByUser(userId: string, limit = 50): Promise<Notification[]> {
    return db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit,
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
  }): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(data).returning();
    return notif;
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const [notif] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return notif;
  }

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId)));
  }
}