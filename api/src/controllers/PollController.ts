import type { Request, Response } from 'express';
import { PollingService } from '../services/PollingService.js';

export const PollController = {
  async trigger(req: Request, res: Response): Promise<void> {
    const results = await PollingService.pollConnectionsForUser(req.userId!);
    res.json({ results });
  },
};
