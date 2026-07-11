import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { AlertController } from '../controllers/AlertController.js';

export const alertRoutes = Router();

alertRoutes.use(requireAuth);
alertRoutes.get('/', asyncErrorWrapper(AlertController.list));
alertRoutes.patch('/:id', asyncErrorWrapper(AlertController.update));
