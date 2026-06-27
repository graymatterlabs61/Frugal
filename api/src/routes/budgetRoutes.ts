import { Router } from 'express';
import { budgetController, alertController, notificationController } from '@/controllers/BudgetController';
import { authenticate } from '@/middleware/auth';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

export const budgetRulesRouter = Router();
budgetRulesRouter.use(authenticate);
budgetRulesRouter.get('/', asyncErrorWrapper((req, res) => budgetController.listRules(req, res)));
budgetRulesRouter.post('/', asyncErrorWrapper((req, res) => budgetController.createRule(req, res)));
budgetRulesRouter.patch('/:id', asyncErrorWrapper((req, res) => budgetController.updateRule(req, res)));
budgetRulesRouter.delete('/:id', asyncErrorWrapper((req, res) => budgetController.deleteRule(req, res)));

export const alertsRouter = Router();
alertsRouter.use(authenticate);
alertsRouter.get('/', asyncErrorWrapper((req, res) => alertController.list(req, res)));
alertsRouter.patch('/:id', asyncErrorWrapper((req, res) => alertController.update(req, res)));

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
notificationsRouter.get('/', asyncErrorWrapper((req, res) => notificationController.list(req, res)));
notificationsRouter.patch('/:id/read', asyncErrorWrapper((req, res) => notificationController.markRead(req, res)));
notificationsRouter.patch('/read-all', asyncErrorWrapper((req, res) => notificationController.markAllRead(req, res)));