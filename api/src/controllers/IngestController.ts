import type { Request, Response } from 'express';
import { z } from 'zod';
import { IngestService } from '../services/IngestService.js';
import { providerEnum } from '../db/schema.js';

const ingestSchema = z
  .object({
    endUserId: z.string().min(1).max(200),
    projectId: z.string().uuid(),
    provider: z.enum(providerEnum.enumValues).optional(),
    model: z.string().max(200).optional(),
    tokensInput: z.number().int().min(0).default(0),
    tokensOutput: z.number().int().min(0).default(0),
    costUsd: z.number().min(0),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const IngestController = {
  async create(req: Request, res: Response): Promise<void> {
    const body = ingestSchema.parse(req.body);
    const event = await IngestService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ event });
  },
};
