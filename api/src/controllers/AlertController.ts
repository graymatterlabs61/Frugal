import type { Request, Response } from 'express';
import { z } from 'zod';
import { AlertService } from '../services/AlertService.js';

const updateAlertSchema = z.object({ status: z.enum(['acknowledged', 'resolved']) }).strict();

export const AlertController = {
  async list(req: Request, res: Response): Promise<void> {
    const alerts = await AlertService.list(req.userId!);
    res.json({ alerts });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateAlertSchema.parse(req.body);
    const alert = await AlertService.update(req.params.id as string, req.userId!, body.status);
    res.json({ alert });
  },
};
