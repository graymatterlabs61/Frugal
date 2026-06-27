import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UsageRepository } from '@/repositories/UsageRepository';

const usageRepository = new UsageRepository();

class DashboardController extends BaseController {
  async summary(req: Request, res: Response): Promise<void> {
    try {
      const data = await usageRepository.getDashboardSummary(req.user!.id);
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(error, res, 'dashboardSummary');
    }
  }

  async spendChart(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt((req.query.days as string) ?? '30', 10);
      const validDays = [7, 30, 90].includes(days) ? days : 30;
      const data = await usageRepository.getSpendChart(req.user!.id, validDays);
      this.handleSuccess(res, { chart: data });
    } catch (error) {
      this.handleError(error, res, 'spendChart');
    }
  }

  async topProjects(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt((req.query.days as string) ?? '30', 10);
      const validDays = [7, 30, 90].includes(days) ? days : 30;
      const data = await usageRepository.getTopProjects(req.user!.id, validDays);
      this.handleSuccess(res, { projects: data });
    } catch (error) {
      this.handleError(error, res, 'topProjects');
    }
  }
}

export const dashboardController = new DashboardController();