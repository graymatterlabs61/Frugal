import { z } from 'zod';

export const ingestSchema = z
  .object({
    endUserId: z.string().min(1).max(256),
    projectId: z.string().uuid(),
    provider: z.enum(['openai', 'anthropic', 'replicate', 'falai', 'gemini']).optional(),
    model: z.string().max(100).optional(),
    tokensInput: z.number().int().min(0),
    tokensOutput: z.number().int().min(0),
    costUsd: z.number().min(0),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export type IngestInput = z.infer<typeof ingestSchema>;