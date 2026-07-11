import { BudgetRuleRepository } from '../repositories/BudgetRuleRepository.js';
import { isActionAllowed } from '../utils/budgetRuleTier.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { BudgetWindow, RuleAction } from '../db/schema.js';

export const BudgetRuleService = {
  async list(projectId: string, userId: string) {
    const project = await BudgetRuleRepository.findProjectForUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return BudgetRuleRepository.listForProject(projectId, userId);
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: {
      projectId: string;
      budgetWindow: BudgetWindow;
      limitUsd: number;
      thresholdPct?: number | undefined;
      action: RuleAction;
    },
  ) {
    // Tier gate first: a free-plan user is rejected from creating ANY budget rule
    // regardless of which project they name, not just certain actions/projects.
    if (!isActionAllowed(userPlan, data.action)) {
      throw new ForbiddenError('This action is not available on your plan');
    }

    const project = await BudgetRuleRepository.findProjectForUser(data.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    return BudgetRuleRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    userPlan: string | undefined,
    data: {
      budgetWindow?: BudgetWindow | undefined;
      limitUsd?: number | undefined;
      thresholdPct?: number | undefined;
      action?: RuleAction | undefined;
      isActive?: boolean | undefined;
    },
  ) {
    if (data.action !== undefined && !isActionAllowed(userPlan, data.action)) {
      throw new ForbiddenError('This action is not available on your plan');
    }
    const rule = await BudgetRuleRepository.update(id, userId, data);
    if (!rule) throw new NotFoundError('Budget rule not found');
    return rule;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await BudgetRuleRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Budget rule not found');
  },
};
