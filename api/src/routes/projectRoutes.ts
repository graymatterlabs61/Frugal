import { Router } from 'express';
import { projectController, connectionController } from '@/controllers/ProjectController';
import { authenticate } from '@/middleware/auth';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

const router = Router();

router.use(authenticate);

// Projects
router.get('/', asyncErrorWrapper((req, res) => projectController.list(req, res)));
router.post('/', asyncErrorWrapper((req, res) => projectController.create(req, res)));
router.get('/:id', asyncErrorWrapper((req, res) => projectController.get(req, res)));
router.patch('/:id', asyncErrorWrapper((req, res) => projectController.update(req, res)));
router.delete('/:id', asyncErrorWrapper((req, res) => projectController.delete(req, res)));

export default router;

const connectionRouter = Router();
connectionRouter.use(authenticate);

connectionRouter.get('/', asyncErrorWrapper((req, res) => connectionController.list(req, res)));
connectionRouter.post('/', asyncErrorWrapper((req, res) => connectionController.create(req, res)));
connectionRouter.patch('/:id', asyncErrorWrapper((req, res) => connectionController.update(req, res)));
connectionRouter.delete('/:id', asyncErrorWrapper((req, res) => connectionController.delete(req, res)));

export { connectionRouter };