import { Router } from 'express';
import { dashboardController } from '@/controllers/DashboardController';
import { authenticate } from '@/middleware/auth';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

const router = Router();

router.use(authenticate);

router.get('/', asyncErrorWrapper((req, res) => dashboardController.summary(req, res)));
router.get('/spend-chart', asyncErrorWrapper((req, res) => dashboardController.spendChart(req, res)));
router.get('/top-projects', asyncErrorWrapper((req, res) => dashboardController.topProjects(req, res)));

export default router;