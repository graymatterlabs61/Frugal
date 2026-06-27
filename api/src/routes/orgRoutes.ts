import { Router } from 'express';
import { orgController } from '@/controllers/OrgController';
import { authenticate, requireCorporate } from '@/middleware/auth';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

const router = Router();

router.use(authenticate);
router.use(requireCorporate);

router.post('/', asyncErrorWrapper((req, res) => orgController.create(req, res)));
router.get('/:id', asyncErrorWrapper((req, res) => orgController.get(req, res)));
router.patch('/:id', asyncErrorWrapper((req, res) => orgController.update(req, res)));
router.get('/:id/members', asyncErrorWrapper((req, res) => orgController.getMembers(req, res)));
router.post('/:id/invite', asyncErrorWrapper((req, res) => orgController.invite(req, res)));
router.patch('/:id/members/:userId', asyncErrorWrapper((req, res) => orgController.updateMemberRole(req, res)));
router.delete('/:id/members/:userId', asyncErrorWrapper((req, res) => orgController.removeMember(req, res)));

export default router;