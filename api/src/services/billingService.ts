import Stripe from 'stripe';
import { config } from '@/config/unifiedConfig';
import { UserRepository } from '@/repositories/UserRepository';
import { AppError, NotFoundError } from '@/utils/errors';
import type { Plan } from '@/utils/tier';

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2025-02-24.acacia' });

const PRICE_TO_PLAN: Record<string, Plan> = {
  [config.stripe.prices.plusMonthly]: 'plus',
  [config.stripe.prices.plusYearly]: 'plus',
  [config.stripe.prices.proMonthly]: 'pro',
  [config.stripe.prices.proYearly]: 'pro',
};

export class BillingService {
  constructor(private readonly userRepository: UserRepository) {}

  async createCheckout(
    userId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const validPrices = Object.values(config.stripe.prices);
    if (!validPrices.includes(priceId)) {
      throw new AppError('INVALID_PRICE', 'Invalid price ID', 400);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    let customerId = user.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;
      await this.userRepository.update(userId, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new AppError('STRIPE_ERROR', 'Failed to create checkout session', 500);
    return { url: session.url };
  }

  async createPortal(userId: string, returnUrl: string): Promise<{ url: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user?.stripeCustomerId) throw new NotFoundError('No billing account found');

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async getInvoices(userId: string): Promise<Stripe.Invoice[]> {
    const user = await this.userRepository.findById(userId);
    if (!user?.stripeCustomerId) return [];

    const { data } = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });
    return data;
  }

  async handleWebhook(rawBody: Buffer, sig: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, config.stripe.webhookSecret);
    } catch {
      throw new AppError('WEBHOOK_SIGNATURE', 'Invalid webhook signature', 400);
    }

    const userRepository = this.userRepository;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, userRepository);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub, userRepository);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub, userRepository);
        break;
      }
    }
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  userRepository: UserRepository,
): Promise<void> {
  if (!session.customer || !session.subscription) return;

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

  const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });

  const priceId = (sub.items.data[0]?.price as Stripe.Price | undefined)?.id;
  const plan: Plan = priceId ? (PRICE_TO_PLAN[priceId] ?? 'free') : 'free';

  const user = await userRepository.findByStripeCustomerId(customerId);
  if (user) {
    await userRepository.update(user.id, { plan, stripeSubscriptionId: subscriptionId });
  }
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
  userRepository: UserRepository,
): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const user = await userRepository.findByStripeCustomerId(customerId);
  if (user) {
    await userRepository.update(user.id, { plan: 'free', stripeSubscriptionId: null });
  }
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription,
  userRepository: UserRepository,
): Promise<void> {
  const priceId = (sub.items.data[0]?.price as Stripe.Price | undefined)?.id;
  if (!priceId) return;

  const plan: Plan = PRICE_TO_PLAN[priceId] ?? 'free';
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const user = await userRepository.findByStripeCustomerId(customerId);
  if (user) {
    await userRepository.update(user.id, { plan });
  }
}