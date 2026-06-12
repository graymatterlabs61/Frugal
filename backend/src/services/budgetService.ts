import type {
  AlertLogRow,
  BudgetRepository,
  BudgetRuleRow,
} from "../repositories/BudgetRepository.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import type { Plan } from "../utils/tier.js";
import { PLAN_LIMITS } from "../utils/tier.js";

type CreateBudgetInput = {
  budgetWindow: BudgetRuleRow["budgetWindow"];
  limitUsd: string;
  thresholdPct?: number;
  action?: BudgetRuleRow["action"];
};

export class BudgetService {
  constructor(
    private readonly budgetRepo: BudgetRepository,
    private readonly projectRepo: ProjectRepository
  ) {}

  async list(userId: string, projectId: string): Promise<BudgetRuleRow[]> {
    // Verify project ownership (returns 404 for foreign IDs — IDOR protection)
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) throw new NotFoundError("Project not found");
    return this.budgetRepo.findAllByProject(userId, projectId);
  }

  async create(
    userId: string,
    projectId: string,
    data: CreateBudgetInput,
    userPlan: Plan
  ): Promise<BudgetRuleRow> {
    // Verify project ownership
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) throw new NotFoundError("Project not found");

    // Plan capability checks
    if (data.action === "block" && !PLAN_LIMITS[userPlan].allowsBlock) {
      throw new ValidationError(
        `The "block" action requires a Starter plan or higher. Current plan: ${userPlan}.`
      );
    }
    if (data.action === "throttle" && !PLAN_LIMITS[userPlan].allowsThrottle) {
      throw new ValidationError(
        `The "throttle" action requires a Pro plan. Current plan: ${userPlan}.`
      );
    }

    return this.budgetRepo.create(userId, projectId, data);
  }

  async delete(userId: string, ruleId: string): Promise<void> {
    const rule = await this.budgetRepo.findById(userId, ruleId);
    if (!rule) throw new NotFoundError("Budget rule not found");

    const deleted = await this.budgetRepo.delete(userId, ruleId);
    if (!deleted) throw new NotFoundError("Budget rule not found");
  }

  async getAlerts(userId: string, limit?: number): Promise<AlertLogRow[]> {
    return this.budgetRepo.findRecentAlerts(userId, limit);
  }

  async getAlertsByProject(userId: string, projectId: string): Promise<AlertLogRow[]> {
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) throw new NotFoundError("Project not found");
    return this.budgetRepo.findAlertsByProject(userId, projectId);
  }
}
