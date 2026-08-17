import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { IngestController } from '../controllers/IngestController.js';

export const ingestRoutes = Router();

ingestRoutes.use(requireAuth);
ingestRoutes.post('/', asyncErrorWrapper(IngestController.create));
