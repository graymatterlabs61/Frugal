import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { budgetRules, projects, type BudgetWindow, type RuleAction } from '../db/schema.js';

export const BudgetRuleRepository = {
  async listForProject(projectId: string, userId: string) {
    return db
      .select()
      .from(budgetRules)
      .where(and(eq(budgetRules.projectId, projectId), eq(budgetRules.userId, userId)));
  },

  async findProjectForUser(projectId: string, userId: string) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    return row;
  },

  /** System-side (not user-scoped) — budgetChecker evaluates every active rule for a project. */
  async listActiveForProject(projectId: string) {
    return db
      .select()
      .from(budgetRules)
      .where(and(eq(budgetRules.projectId, projectId), eq(budgetRules.isActive, true)));
  },

  async create(
    userId: string,
    data: {
      projectId: string;
      budgetWindow: BudgetWindow;
      limitUsd: number;
      thresholdPct?: number | undefined;
      action: RuleAction;
    },
  ) {
    const [row] = await db
      .insert(budgetRules)
      .values({
        userId,
        projectId: data.projectId,
        budgetWindow: data.budgetWindow,
        limitUsd: data.limitUsd.toFixed(2),
        thresholdPct: data.thresholdPct,
        action: data.action,
      })
      .returning();
    return row!;
  },

  async update(
    id: string,
    userId: string,
    data: {
      budgetWindow?: BudgetWindow | undefined;
      limitUsd?: number | undefined;
      thresholdPct?: number | undefined;
      action?: RuleAction | undefined;
      isActive?: boolean | undefined;
    },
  ) {
    const { limitUsd, ...rest } = data;
    const [row] = await db
      .update(budgetRules)
      .set({
        ...rest,
        ...(limitUsd !== undefined ? { limitUsd: limitUsd.toFixed(2) } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(budgetRules.id, id), eq(budgetRules.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(budgetRules)
      .where(and(eq(budgetRules.id, id), eq(budgetRules.userId, userId)))
      .returning({ id: budgetRules.id });
    return result.length > 0;
  },
};
