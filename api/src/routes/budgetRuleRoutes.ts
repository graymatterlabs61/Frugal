import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { BudgetRuleController } from '../controllers/BudgetRuleController.js';

export const budgetRuleRoutes = Router();

budgetRuleRoutes.use(requireAuth);
budgetRuleRoutes.get('/', asyncErrorWrapper(BudgetRuleController.list));
budgetRuleRoutes.post('/', asyncErrorWrapper(BudgetRuleController.create));
budgetRuleRoutes.patch('/:id', asyncErrorWrapper(BudgetRuleController.update));
budgetRuleRoutes.delete('/:id', asyncErrorWrapper(BudgetRuleController.remove));
