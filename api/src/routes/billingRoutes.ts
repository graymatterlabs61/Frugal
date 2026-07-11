import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { BillingController } from '../controllers/BillingController.js';

export const billingRoutes = Router();

billingRoutes.use(requireAuth);
billingRoutes.post('/checkout', asyncErrorWrapper(BillingController.checkout));
billingRoutes.post('/portal', asyncErrorWrapper(BillingController.portal));
billingRoutes.get('/invoices', asyncErrorWrapper(BillingController.invoices));
