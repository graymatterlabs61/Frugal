import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { budgetWindowEnum, ruleActionEnum } from "../db/schema.js";
import { getUserId } from "../middleware/requireAuth.js";
import { BudgetRepository } from "../repositories/BudgetRepository.js";
import { ProjectRepository } from "../repositories/ProjectRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { BudgetService } from "../services/budgetService.js";
import { NotFoundError } from "../utils/errors.js";
import { BaseController } from "./BaseController.js";

const windowValues = budgetWindowEnum.enumValues;
const actionValues = ruleActionEnum.enumValues;

const createSchema = z
  .object({
    budgetWindow: z.enum(windowValues),
    limitUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, "limitUsd must be a decimal string"),
    thresholdPct: z.number().int().min(1).max(100).optional(),
    action: z.enum(actionValues).optional(),
  })
  .strict();

const projectParamsSchema = z.object({ projectId: z.string().uuid() }).strict();
const ruleParamsSchema = z.object({ id: z.string().uuid() }).strict();

class BudgetController extends BaseController {
  private getService(): BudgetService {
    return new BudgetService(new BudgetRepository(db), new ProjectRepository(db));
  }

  private async getUserPlan(userId: string) {
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user.plan;
  }

  async list(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { projectId } = projectParamsSchema.parse(req.params);
    const rules = await this.getService().list(userId, projectId);
    this.handleSuccess(res, rules);
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { projectId } = projectParamsSchema.parse(req.params);
    const input = createSchema.parse(req.body);
    const plan = await this.getUserPlan(userId);
    const rule = await this.getService().create(userId, projectId, input, plan);
    this.handleCreated(res, rule);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = ruleParamsSchema.parse(req.params);
    await this.getService().delete(userId, id);
    this.handleNoContent(res);
  }
}

export const budgetController = new BudgetController();
