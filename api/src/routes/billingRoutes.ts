import { Router } from 'express';
import { billingController } from '@/controllers/BillingController';
import { ingestController } from '@/controllers/IngestController';
import { authenticate, requirePro } from '@/middleware/auth';
import { asyncErrorWrapper } from '@/middleware/asyncErrorWrapper';

export const billingRouter = Router();

// Webhook must use raw body — registered before json middleware in app.ts
billingRouter.post(
  '/webhook',
  asyncErrorWrapper((req, res) => billingController.webhook(req, res)),
);

billingRouter.use(authenticate);
billingRouter.post('/checkout', asyncErrorWrapper((req, res) => billingController.checkout(req, res)));
billingRouter.post('/portal', asyncErrorWrapper((req, res) => billingController.portal(req, res)));
billingRouter.get('/invoices', asyncErrorWrapper((req, res) => billingController.invoices(req, res)));

export const ingestRouter = Router();
ingestRouter.use(authenticate);
ingestRouter.use(requirePro);
ingestRouter.post('/', asyncErrorWrapper((req, res) => ingestController.ingest(req, res)));