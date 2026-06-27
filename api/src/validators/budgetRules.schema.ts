import { z } from 'zod';

export const createBudgetRuleSchema = z
  .object({
    projectId: z.string().uuid(),
    budgetWindow: z.enum(['daily', 'monthly']),
    limitUsd: z.number().positive().max(1_000_000),
    thresholdPct: z.number().int().min(1).max(100).default(80),
    action: z.enum(['alert', 'block', 'throttle']).default('alert'),
  })
  .strict();

export const updateBudgetRuleSchema = z
  .object({
    limitUsd: z.number().positive().max(1_000_000).optional(),
    thresholdPct: z.number().int().min(1).max(100).optional(),
    action: z.enum(['alert', 'block', 'throttle']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type CreateBudgetRuleInput = z.infer<typeof createBudgetRuleSchema>;
export type UpdateBudgetRuleInput = z.infer<typeof updateBudgetRuleSchema>;

export const listBudgetRulesQuerySchema = z.object({
  projectId: z.string().uuid(),
});

export const updateAlertSchema = z.object({
  status: z.enum(['acknowledged', 'resolved']),
}).strict();