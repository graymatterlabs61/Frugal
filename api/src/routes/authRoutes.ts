import { Router } from 'express';
import { authController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';
import { loginRateLimit } from '@/middleware/rateLimit';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

const router = Router();

router.post('/register', asyncErrorWrapper((req, res) => authController.register(req, res)));
router.post('/login', loginRateLimit, asyncErrorWrapper((req, res) => authController.login(req, res)));
router.post('/google', asyncErrorWrapper((req, res) => authController.googleAuth(req, res)));
router.post('/logout', (req, res) => authController.logout(req, res));

router.post(
  '/change-password',
  authenticate,
  asyncErrorWrapper((req, res) => authController.changePassword(req, res)),
);
router.get(
  '/me',
  authenticate,
  asyncErrorWrapper((req, res) => authController.me(req, res)),
);
router.patch(
  '/profile',
  authenticate,
  asyncErrorWrapper((req, res) => authController.updateProfile(req, res)),
);

export default router;