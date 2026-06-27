import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { BudgetService } from '@/services/budgetService';
import { BudgetRepository, AlertRepository, NotificationRepository } from '@/repositories/BudgetRepository';
import { UsageRepository } from '@/repositories/UsageRepository';
import {
  createBudgetRuleSchema,
  updateBudgetRuleSchema,
  listBudgetRulesQuerySchema,
  updateAlertSchema,
} from '@/validators/budgetRules.schema';


const budgetService = new BudgetService(
  new BudgetRepository(),
  new AlertRepository(),
  new NotificationRepository(),
  new UsageRepository(),
);
const alertRepository = new AlertRepository();
const notificationRepository = new NotificationRepository();

class BudgetController extends BaseController {
  async listRules(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = listBudgetRulesQuerySchema.parse(req.query);
      const rules = await budgetService.getRules(projectId);
      this.handleSuccess(res, { rules });
    } catch (error) {
      this.handleError(error, res, 'listBudgetRules');
    }
  }

  async createRule(req: Request, res: Response): Promise<void> {
    try {
      const input = createBudgetRuleSchema.parse(req.body);
      const rule = await budgetService.createRule(req.user!.id, req.user!.plan, input);
      this.handleCreated(res, { rule });
    } catch (error) {
      this.handleError(error, res, 'createBudgetRule');
    }
  }

  async updateRule(req: Request, res: Response): Promise<void> {
    try {
      const input = updateBudgetRuleSchema.parse(req.body);
      const rule = await budgetService.updateRule(this.param(req, 'id'), req.user!.id, req.user!.plan, input);
      this.handleSuccess(res, { rule });
    } catch (error) {
      this.handleError(error, res, 'updateBudgetRule');
    }
  }

  async deleteRule(req: Request, res: Response): Promise<void> {
    try {
      await budgetService.deleteRule(this.param(req, 'id'), req.user!.id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'deleteBudgetRule');
    }
  }
}

class AlertController extends BaseController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await alertRepository.findByUser(req.user!.id);
      this.handleSuccess(res, { alerts });
    } catch (error) {
      this.handleError(error, res, 'listAlerts');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { status } = updateAlertSchema.parse(req.body);
      const alert = await alertRepository.update(this.param(req, 'id'), {
        status,
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
      });
      this.handleSuccess(res, { alert });
    } catch (error) {
      this.handleError(error, res, 'updateAlert');
    }
  }
}

class NotificationController extends BaseController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const notifs = await notificationRepository.findByUser(req.user!.id);
      this.handleSuccess(res, { notifications: notifs });
    } catch (error) {
      this.handleError(error, res, 'listNotifications');
    }
  }

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const notif = await notificationRepository.markRead(this.param(req, 'id'), req.user!.id);
      this.handleSuccess(res, { notification: notif });
    } catch (error) {
      this.handleError(error, res, 'markNotificationRead');
    }
  }

  async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      await notificationRepository.markAllRead(req.user!.id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'markAllNotificationsRead');
    }
  }
}

export const budgetController = new BudgetController();
export const alertController = new AlertController();
export const notificationController = new NotificationController();