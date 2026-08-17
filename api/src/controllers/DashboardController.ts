import type { Request, Response } from 'express';
import { z } from 'zod';
import { DashboardService } from '../services/DashboardService.js';

const spendChartQuerySchema = z
  .object({ days: z.coerce.number().int().min(1).max(365).default(30) })
  .strict();

const topProjectsQuerySchema = z
  .object({ limit: z.coerce.number().int().min(1).max(50).default(5) })
  .strict();

export const DashboardController = {
  async summary(req: Request, res: Response): Promise<void> {
    const summary = await DashboardService.summary(req.userId!);
    res.json(summary);
  },

  async spendChart(req: Request, res: Response): Promise<void> {
    const { days } = spendChartQuerySchema.parse(req.query);
    const series = await DashboardService.spendChart(req.userId!, days);
    res.json({ series });
  },

  async topProjects(req: Request, res: Response): Promise<void> {
    const { limit } = topProjectsQuerySchema.parse(req.query);
    const projects = await DashboardService.topProjects(req.userId!, limit);
    res.json({ projects });
  },
};
