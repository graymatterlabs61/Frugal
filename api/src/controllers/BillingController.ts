import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { BillingService } from '@/services/billingService';
import { UserRepository } from '@/repositories/UserRepository';
import { checkoutSchema, portalSchema } from '@/validators/billing.schema';
import { ValidationError } from '@/utils/errors';

const billingService = new BillingService(new UserRepository());

class BillingController extends BaseController {
  async checkout(req: Request, res: Response): Promise<void> {
    try {
      const { priceId, successUrl, cancelUrl } = checkoutSchema.parse(req.body);
      const result = await billingService.createCheckout(
        req.user!.id,
        req.user!.email,
        priceId,
        successUrl,
        cancelUrl,
      );
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'checkout');
    }
  }

  async portal(req: Request, res: Response): Promise<void> {
    try {
      const { returnUrl } = portalSchema.parse(req.body);
      const result = await billingService.createPortal(req.user!.id, returnUrl);
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'portal');
    }
  }

  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;
      if (!sig) throw new ValidationError('Missing stripe-signature header');
      await billingService.handleWebhook(req.body as Buffer, sig);
      this.handleSuccess(res, { received: true });
    } catch (error) {
      this.handleError(error, res, 'stripeWebhook');
    }
  }

  async invoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await billingService.getInvoices(req.user!.id);
      this.handleSuccess(res, { invoices });
    } catch (error) {
      this.handleError(error, res, 'invoices');
    }
  }
}

export const billingController = new BillingController();