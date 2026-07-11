import type { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService.js';

export const NotificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const notifications = await NotificationService.list(req.userId!);
    res.json({ notifications });
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.markRead(req.params.id as string, req.userId!);
    res.json({ notification });
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    await NotificationService.markAllRead(req.userId!);
    res.status(204).send();
  },
};
