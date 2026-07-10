import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { ConnectionController } from '../controllers/ConnectionController.js';

export const connectionRoutes = Router();

connectionRoutes.use(requireAuth);
connectionRoutes.get('/', asyncErrorWrapper(ConnectionController.list));
connectionRoutes.post('/', asyncErrorWrapper(ConnectionController.create));
connectionRoutes.patch('/:id', asyncErrorWrapper(ConnectionController.update));
connectionRoutes.delete('/:id', asyncErrorWrapper(ConnectionController.remove));
