import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { PollController } from '../controllers/PollController.js';

export const pollRoutes = Router();

pollRoutes.use(requireAuth);
pollRoutes.post('/', asyncErrorWrapper(PollController.trigger));
