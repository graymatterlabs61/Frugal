import type { Request, Response } from 'express';
import { z } from 'zod';
import { BillingService } from '../services/BillingService.js';
import { getStripe } from '../utils/stripeClient.js';
import { config } from '../config/unifiedConfig.js';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const checkoutSchema = z
  .object({ tier: z.enum(['plus', 'pro']), interval: z.enum(['monthly', 'yearly']) })
  .strict();

export const BillingController = {
  async checkout(req: Request, res: Response): Promise<void> {
    const body = checkoutSchema.parse(req.body);
    const url = await BillingService.createCheckoutSession(req.userId!, body.tier, body.interval);
    res.json({ url });
  },

  async portal(req: Request, res: Response): Promise<void> {
    const url = await BillingService.createPortalSession(req.userId!);
    res.json({ url });
  },

  async invoices(req: Request, res: Response): Promise<void> {
    const invoices = await BillingService.listInvoices(req.userId!);
    res.json({ invoices });
  },

  async webhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new ValidationError('Missing stripe-signature header');
    }
    if (!config.stripe.webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        config.stripe.webhookSecret,
      );
    } catch (err) {
      logger.warn({ err }, 'Stripe webhook signature verification failed');
      res
        .status(400)
        .json({ error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' } });
      return;
    }

    await BillingService.handleWebhookEvent(event);
    res.json({ received: true });
  },
};
