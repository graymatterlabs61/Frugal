import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { alertLog, budgetRules } from "../db/schema.js";

export type BudgetRuleRow = typeof budgetRules.$inferSelect;
export type AlertLogRow = typeof alertLog.$inferSelect;

type CreateBudgetData = {
  budgetWindow: BudgetRuleRow["budgetWindow"];
  limitUsd: string;
  thresholdPct?: number;
  action?: BudgetRuleRow["action"];
};

type LogAlertData = {
  projectId: string;
  userId: string;
  ruleId?: string;
  spendAtTrigger: string;
  limitUsd: string;
  actionTaken?: string;
  notifiedVia?: string[];
};

export class BudgetRepository {
  constructor(private readonly db: Db) {}

  async findAllByProject(userId: string, projectId: string): Promise<BudgetRuleRow[]> {
    return this.db
      .select()
      .from(budgetRules)
      .where(
        and(
          eq(budgetRules.userId, userId),
          eq(budgetRules.projectId, projectId)
        )
      )
      .orderBy(budgetRules.createdAt);
  }

  async findById(userId: string, ruleId: string): Promise<BudgetRuleRow | null> {
    const rows = await this.db
      .select()
      .from(budgetRules)
      .where(
        and(eq(budgetRules.id, ruleId), eq(budgetRules.userId, userId))
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /** Unscoped — for the polling worker to check active rules for a project. */
  async findActiveByProject(projectId: string): Promise<BudgetRuleRow[]> {
    return this.db
      .select()
      .from(budgetRules)
      .where(
        and(
          eq(budgetRules.projectId, projectId),
          eq(budgetRules.isActive, true)
        )
      );
  }

  async create(
    userId: string,
    projectId: string,
    data: CreateBudgetData
  ): Promise<BudgetRuleRow> {
    const rows = await this.db
      .insert(budgetRules)
      .values({
        userId,
        projectId,
        budgetWindow: data.budgetWindow,
        limitUsd: data.limitUsd,
        thresholdPct: data.thresholdPct ?? 80,
        action: data.action ?? "alert",
        isActive: true,
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create budget rule");
    return row;
  }

  /** Returns false if not found or not owned by userId. */
  async delete(userId: string, ruleId: string): Promise<boolean> {
    const rows = await this.db
      .delete(budgetRules)
      .where(
        and(eq(budgetRules.id, ruleId), eq(budgetRules.userId, userId))
      )
      .returning({ id: budgetRules.id });
    return rows.length > 0;
  }

  async logAlert(data: LogAlertData): Promise<AlertLogRow> {
    const rows = await this.db
      .insert(alertLog)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        ruleId: data.ruleId ?? null,
        spendAtTrigger: data.spendAtTrigger,
        limitUsd: data.limitUsd,
        actionTaken: data.actionTaken ?? null,
        notifiedVia: data.notifiedVia ?? [],
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to log alert");
    return row;
  }

  async findRecentAlerts(userId: string, limit = 10): Promise<AlertLogRow[]> {
    return this.db
      .select()
      .from(alertLog)
      .where(eq(alertLog.userId, userId))
      .orderBy(desc(alertLog.triggeredAt))
      .limit(limit);
  }

  async findAlertsByProject(userId: string, projectId: string): Promise<AlertLogRow[]> {
    return this.db
      .select()
      .from(alertLog)
      .where(
        and(
          eq(alertLog.userId, userId),
          eq(alertLog.projectId, projectId)
        )
      )
      .orderBy(desc(alertLog.triggeredAt));
  }

  /**
   * Returns true if an alert for ruleId has already fired within the last windowHours.
   * Used for dedup to prevent alert storms.
   */
  async hasRecentAlert(ruleId: string, windowHours: number): Promise<boolean> {
    const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const rows = await this.db
      .select({ id: alertLog.id })
      .from(alertLog)
      .where(
        and(
          eq(alertLog.ruleId, ruleId),
          gte(alertLog.triggeredAt, sql`${cutoff}::timestamptz`)
        )
      )
      .limit(1);
    return rows.length > 0;
  }
}
