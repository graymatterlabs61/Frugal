import type { Request, Response } from 'express';
import { z } from 'zod';
import { BudgetRuleService } from '../services/BudgetRuleService.js';
import { budgetWindowEnum, ruleActionEnum } from '../db/schema.js';

const listQuerySchema = z.object({ projectId: z.string().uuid() }).strict();

const createBudgetRuleSchema = z
  .object({
    projectId: z.string().uuid(),
    budgetWindow: z.enum(budgetWindowEnum.enumValues),
    limitUsd: z.number().positive(),
    thresholdPct: z.number().min(1).max(100).optional(),
    action: z.enum(ruleActionEnum.enumValues),
  })
  .strict();

const updateBudgetRuleSchema = z
  .object({
    budgetWindow: z.enum(budgetWindowEnum.enumValues).optional(),
    limitUsd: z.number().positive().optional(),
    thresholdPct: z.number().min(1).max(100).optional(),
    action: z.enum(ruleActionEnum.enumValues).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const BudgetRuleController = {
  async list(req: Request, res: Response): Promise<void> {
    const { projectId } = listQuerySchema.parse(req.query);
    const budgetRules = await BudgetRuleService.list(projectId, req.userId!);
    res.json({ budgetRules });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createBudgetRuleSchema.parse(req.body);
    const budgetRule = await BudgetRuleService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ budgetRule });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateBudgetRuleSchema.parse(req.body);
    const budgetRule = await BudgetRuleService.update(
      req.params.id as string,
      req.userId!,
      req.userPlan,
      body,
    );
    res.json({ budgetRule });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await BudgetRuleService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  },
};
