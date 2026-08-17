import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { DashboardController } from '../controllers/DashboardController.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get('/', asyncErrorWrapper(DashboardController.summary));
dashboardRoutes.get('/spend-chart', asyncErrorWrapper(DashboardController.spendChart));
dashboardRoutes.get('/top-projects', asyncErrorWrapper(DashboardController.topProjects));
