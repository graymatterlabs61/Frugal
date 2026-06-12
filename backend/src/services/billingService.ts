import Stripe from "stripe";
import { config } from "../config/unifiedConfig.js";
import type { UserRepository } from "../repositories/UserRepository.js";
import type { Plan } from "../utils/tier.js";

export interface InvoiceItem {
  id: string;
  date: number;
  description: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}

export interface PaymentMethodInfo {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

function getStripe(): Stripe {
  if (!config.stripe.secretKey) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }
  return new Stripe(config.stripe.secretKey, { apiVersion: "2026-05-27.dahlia" });
}

function priceIdToPlan(priceId: string): Plan {
  const { starter, growth, pro } = config.stripe.prices;
  if (priceId === pro) return "pro";
  if (priceId === starter) return "plus";
  if (priceId === growth) return "corp_starter";
  return "free";
}

function planToPriceId(plan: "plus" | "pro" | "corp_starter" | "corp_growth" | "corp_scale"): string {
  const { starter, growth, pro } = config.stripe.prices;
  const map: Record<string, string | undefined> = {
    plus: starter,
    pro: pro,
    corp_starter: growth,
  };
  const id = map[plan];
  if (!id) throw new Error(`No Stripe price configured for plan "${plan}"`);
  return id;
}

export class BillingService {
  constructor(private readonly userRepo: UserRepository) {}

  async createCheckoutSession(opts: {
    userId: string;
    email: string;
    plan: "plus" | "pro" | "corp_starter" | "corp_growth" | "corp_scale";
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    const stripe = getStripe();
    const user = await this.userRepo.findById(opts.userId);
    if (!user) throw new Error("User not found");

    // Ensure Stripe customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: opts.email,
        metadata: { userId: opts.userId },
      });
      customerId = customer.id;
      await this.userRepo.updateStripeCustomerId(opts.userId, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planToPriceId(opts.plan), quantity: 1 }],
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      metadata: { userId: opts.userId },
      subscription_data: { metadata: { userId: opts.userId } },
    });

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return { url: session.url };
  }

  async createPortalSession(opts: {
    userId: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    const stripe = getStripe();
    const user = await this.userRepo.findById(opts.userId);
    if (!user?.stripeCustomerId) {
      throw new Error("No billing subscription found. Please subscribe first.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: opts.returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!config.stripe.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch {
      throw new Error("Invalid Stripe webhook signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;
        const userId = session.metadata?.userId;
        if (!userId) break;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? priceIdToPlan(priceId) : "free";
        await this.userRepo.updateStripeSubscription(userId, subscription.id, plan);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? priceIdToPlan(priceId) : "free";
        await this.userRepo.updateStripeSubscription(userId, sub.id, plan);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await this.userRepo.updateStripeSubscription(userId, null, "free");
        break;
      }
    }
  }

  async getInvoices(userId: string): Promise<InvoiceItem[]> {
    const stripe = getStripe();
    const user = await this.userRepo.findById(userId);
    if (!user?.stripeCustomerId) return [];
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });
    return invoices.data.map((inv) => ({
      id: inv.id,
      date: inv.created,
      description: inv.lines.data[0]?.description ?? "Subscription",
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status ?? "unknown",
      pdfUrl: inv.invoice_pdf ?? null,
    }));
  }

  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethodInfo | null> {
    const stripe = getStripe();
    const user = await this.userRepo.findById(userId);
    if (!user?.stripeCustomerId) return null;
    try {
      const pms = await stripe.customers.listPaymentMethods(user.stripeCustomerId, {
        type: "card",
        limit: 1,
      });
      const pm = pms.data[0];
      if (!pm?.card) return null;
      return {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      };
    } catch {
      return null;
    }
  }

  async getSubscription(userId: string): Promise<{
    plan: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    return {
      plan: user.plan,
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    };
  }
}
