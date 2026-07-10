import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { ProjectController } from '../controllers/ProjectController.js';

export const projectRoutes = Router();

projectRoutes.use(requireAuth);
projectRoutes.get('/', asyncErrorWrapper(ProjectController.list));
projectRoutes.post('/', asyncErrorWrapper(ProjectController.create));
projectRoutes.get('/:id', asyncErrorWrapper(ProjectController.get));
projectRoutes.patch('/:id', asyncErrorWrapper(ProjectController.update));
projectRoutes.delete('/:id', asyncErrorWrapper(ProjectController.remove));
