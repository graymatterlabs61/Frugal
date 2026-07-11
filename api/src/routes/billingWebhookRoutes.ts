import { Router, raw } from 'express';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { BillingController } from '../controllers/BillingController.js';

// Mounted BEFORE the app-wide express.json() — Stripe's signature check needs the
// exact raw request bytes, not a re-serialized parsed body. No requireAuth: Stripe
// calls this directly, authenticated by the signature check inside the controller.
export const billingWebhookRoutes = Router();

billingWebhookRoutes.post(
  '/',
  raw({ type: 'application/json' }),
  asyncErrorWrapper(BillingController.webhook),
);
