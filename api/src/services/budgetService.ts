import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { getPlanLimits } from '@/utils/tier';
import { BudgetRepository, AlertRepository, NotificationRepository } from '@/repositories/BudgetRepository';
import { UsageRepository } from '@/repositories/UsageRepository';
import type { CreateBudgetRuleInput, UpdateBudgetRuleInput } from '@/validators/budgetRules.schema';
import type { Plan } from '@/utils/tier';
import type { BudgetRule } from '@/db/schema';

const ALERT_DEDUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export class BudgetService {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly alertRepository: AlertRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly usageRepository: UsageRepository,
  ) {}

  async getRules(projectId: string): Promise<BudgetRule[]> {
    return this.budgetRepository.findByProject(projectId);
  }

  async createRule(
    userId: string,
    plan: Plan,
    input: CreateBudgetRuleInput,
  ): Promise<BudgetRule> {
    const limits = getPlanLimits(plan);
    if (input.action !== 'alert' && !limits.canBlock) {
      throw new ForbiddenError('Block/throttle actions require Plus plan or higher');
    }

    return this.budgetRepository.create({
      ...input,
      userId,
      limitUsd: input.limitUsd.toFixed(2),
    });
  }

  async updateRule(
    id: string,
    userId: string,
    plan: Plan,
    input: UpdateBudgetRuleInput,
  ): Promise<BudgetRule> {
    const rule = await this.budgetRepository.findByIdAndUser(id, userId);
    if (!rule) throw new NotFoundError('Budget rule not found');

    if (input.action && input.action !== 'alert' && !getPlanLimits(plan).canBlock) {
      throw new ForbiddenError('Block/throttle actions require Plus plan or higher');
    }

    const { limitUsd, ...rest } = input;
    return this.budgetRepository.update(id, {
      ...rest,
      ...(limitUsd !== undefined ? { limitUsd: limitUsd.toFixed(2) } : {}),
    });
  }

  async deleteRule(id: string, userId: string): Promise<void> {
    const rule = await this.budgetRepository.findByIdAndUser(id, userId);
    if (!rule) throw new NotFoundError('Budget rule not found');
    await this.budgetRepository.delete(id);
  }

  async checkBudgetForProject(
    userId: string,
    projectId: string,
  ): Promise<void> {
    const rules = await this.budgetRepository.findByProject(projectId);
    if (rules.length === 0) return;

    for (const rule of rules) {
      const since = getBudgetWindowStart(rule.budgetWindow);
      const spend = await this.usageRepository.getTotalSpendByProject(userId, projectId, since);
      const limit = parseFloat(rule.limitUsd);
      const threshold = (rule.thresholdPct / 100) * limit;

      if (spend >= threshold) {
        const hasRecent = await this.alertRepository.hasRecentAlert(
          projectId,
          rule.id,
          ALERT_DEDUP_WINDOW_MS,
        );
        if (hasRecent) continue;

        await this.alertRepository.create({
          projectId,
          userId,
          ruleId: rule.id,
          spendAtTrigger: spend.toFixed(2),
          limitUsd: rule.limitUsd,
          actionTaken: rule.action,
          notifiedVia: [],
        });

        await this.notificationRepository.create({
          userId,
          type: 'budget_alert',
          title: 'Budget threshold reached',
          message: `Project has spent $${spend.toFixed(2)} of $${limit.toFixed(2)} ${rule.budgetWindow} budget (${rule.thresholdPct}% threshold)`,
        });
      }
    }
  }
}

function getBudgetWindowStart(window: 'daily' | 'monthly'): Date {
  const now = new Date();
  if (window === 'daily') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}