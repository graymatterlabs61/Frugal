import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { NotificationController } from '../controllers/NotificationController.js';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get('/', asyncErrorWrapper(NotificationController.list));
notificationRoutes.patch('/read-all', asyncErrorWrapper(NotificationController.markAllRead));
notificationRoutes.patch('/:id/read', asyncErrorWrapper(NotificationController.markRead));
