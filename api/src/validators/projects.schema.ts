import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    color: z.string().max(20).optional(),
    slackWebhookUrl: z.string().url().optional().or(z.literal('')),
    customWebhookUrl: z.string().url().optional().or(z.literal('')),
  })
  .strict();

export const updateProjectSchema = createProjectSchema.partial();

export const createConnectionSchema = z
  .object({
    projectId: z.string().uuid(),
    provider: z.enum(['openai', 'anthropic', 'replicate', 'falai', 'gemini']),
    apiKey: z.string().min(1).max(512),
    label: z.string().max(100).optional(),
  })
  .strict();

export const updateConnectionSchema = z
  .object({
    label: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;