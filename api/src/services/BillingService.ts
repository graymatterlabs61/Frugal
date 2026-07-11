import type Stripe from 'stripe';
import { getStripe } from '../utils/stripeClient.js';
import { priceIdFor, tierForPriceId, type BillableTier, type BillingInterval } from '../utils/billingTier.js';
import { BillingRepository } from '../repositories/BillingRepository.js';
import { config } from '../config/unifiedConfig.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface InvoiceSummary {
  id: string;
  amountPaid: number;
  currency: string;
  status: Stripe.Invoice.Status | null;
  created: number;
  hostedInvoiceUrl: string | null;
}

export const BillingService = {
  async createCheckoutSession(
    userId: string,
    tier: BillableTier,
    interval: BillingInterval,
  ): Promise<string> {
    const stripe = getStripe();
    const priceId = priceIdFor(tier, interval);
    const user = await BillingRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      await BillingRepository.setStripeCustomerId(userId, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      // no payment_method_types — let Stripe auto-select (Apple Pay, Google Pay, Link, etc.)
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { user_id: userId, tier } },
      success_url: `${config.betterAuth.url}/dashboard?checkout=success&tier=${tier}`,
      cancel_url: `${config.betterAuth.url}/dashboard?checkout=canceled`,
      allow_promotion_codes: true,
      metadata: { user_id: userId, tier },
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return session.url;
  },

  async createPortalSession(userId: string): Promise<string> {
    const stripe = getStripe();
    const user = await BillingRepository.findById(userId);
    if (!user?.stripeCustomerId) {
      throw new ValidationError('No billing account yet — start a checkout first');
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${config.betterAuth.url}/dashboard`,
    });
    return session.url;
  },

  async listInvoices(userId: string): Promise<InvoiceSummary[]> {
    const user = await BillingRepository.findById(userId);
    if (!user?.stripeCustomerId) return [];

    const stripe = getStripe();
    const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 20 });
    return invoices.data.map((inv) => ({
      id: inv.id ?? '',
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    }));
  },

  // ponytail: webhook handlers are naturally idempotent SETs (plan/subscriptionId
  // overwritten each time, never incremented) — no processed-event dedupe table.
  // Add one if a future handler needs to increment/credit rather than overwrite.
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier as BillableTier | undefined;
        if (!userId || !tier || typeof session.customer !== 'string') break;
        await BillingRepository.setStripeCustomerId(userId, session.customer);
        await BillingRepository.syncSubscription(session.customer, {
          plan: tier,
          stripeSubscriptionId:
            typeof session.subscription === 'string' ? session.subscription : null,
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer !== 'string') break;
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? tierForPriceId(priceId) : undefined;
        if (!tier) break;
        await BillingRepository.syncSubscription(subscription.customer, {
          plan: tier,
          stripeSubscriptionId: subscription.id,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer !== 'string') break;
        await BillingRepository.syncSubscription(subscription.customer, {
          plan: 'free',
          stripeSubscriptionId: null,
        });
        break;
      }
      default:
        logger.info({ type: event.type }, 'unhandled Stripe webhook event');
    }
  },
};
