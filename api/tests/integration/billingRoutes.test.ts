import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

const stripeMock = vi.hoisted(() => ({
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
  billingPortal: { sessions: { create: vi.fn() } },
  invoices: { list: vi.fn() },
  webhooks: { constructEvent: vi.fn() },
}));

vi.mock('stripe', () => ({
  // arrow functions can't be `new`-ed — Stripe is constructed with `new Stripe(...)`,
  // so the mock implementation must be a regular function that returns the fake client.
  default: vi.fn().mockImplementation(function StripeMock() {
    return stripeMock;
  }),
}));

import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { users } from '../../src/db/authSchema.js';

async function signUp(app: ReturnType<typeof createApp>, email: string) {
  const res = await request(app)
    .post('/api/auth/sign-up/email')
    .send({ email, password: 'correct-horse-battery', name: 'Billing Test' });
  return { cookie: res.headers['set-cookie'] as unknown as string[], userId: res.body.user.id as string };
}

describe('billing routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();

  it('rejects unauthenticated checkout', async () => {
    const res = await request(app)
      .post('/api/v1/billing/checkout')
      .send({ tier: 'plus', interval: 'monthly' });
    expect(res.status).toBe(401);
  });

  describe('checkout', () => {
    let cookie: string[];
    let userId: string;

    beforeAll(async () => {
      ({ cookie, userId } = await signUp(app, `billing-checkout-${randomUUID()}@example.com`));
    });

    it('creates a Stripe customer, persists it, and returns the checkout url', async () => {
      stripeMock.customers.create.mockResolvedValueOnce({ id: 'cus_test_1' });
      stripeMock.checkout.sessions.create.mockResolvedValueOnce({
        url: 'https://checkout.stripe.com/test-session-1',
      });

      const res = await request(app)
        .post('/api/v1/billing/checkout')
        .set('Cookie', cookie)
        .send({ tier: 'plus', interval: 'monthly' });

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://checkout.stripe.com/test-session-1');
      expect(stripeMock.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { user_id: userId } }),
      );
      expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_test_1',
          mode: 'subscription',
          line_items: [{ price: 'price_plus_monthly_test', quantity: 1 }],
        }),
      );

      const [row] = await db.select().from(users).where(eq(users.id, userId));
      expect(row!.stripeCustomerId).toBe('cus_test_1');
    });

    it('reuses the existing Stripe customer on a second checkout', async () => {
      const callsBefore = stripeMock.customers.create.mock.calls.length;
      stripeMock.checkout.sessions.create.mockResolvedValueOnce({
        url: 'https://checkout.stripe.com/test-session-2',
      });

      const res = await request(app)
        .post('/api/v1/billing/checkout')
        .set('Cookie', cookie)
        .send({ tier: 'pro', interval: 'yearly' });

      expect(res.status).toBe(200);
      expect(stripeMock.customers.create.mock.calls.length).toBe(callsBefore);
      expect(stripeMock.checkout.sessions.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          customer: 'cus_test_1',
          line_items: [{ price: 'price_pro_yearly_test', quantity: 1 }],
        }),
      );
    });

    it('rejects an invalid tier', async () => {
      const res = await request(app)
        .post('/api/v1/billing/checkout')
        .set('Cookie', cookie)
        .send({ tier: 'enterprise', interval: 'monthly' });
      expect(res.status).toBe(400);
    });
  });

  // portal + invoices share ONE signed-up user (better-auth's default rate limit is
  // 3 requests/10s across sign-up/sign-in/change-password/change-email combined —
  // see node_modules/better-auth/dist/api/rate-limiter/index.mjs's getDefaultSpecialRules).
  // Ordered so both "no Stripe customer yet" cases run before the one DB write that
  // gives this user a customer id.
  describe('portal & invoices', () => {
    let cookie: string[];
    let userId: string;

    beforeAll(async () => {
      ({ cookie, userId } = await signUp(app, `billing-portal-invoices-${randomUUID()}@example.com`));
    });

    it('portal 400s when the caller has no Stripe customer yet', async () => {
      const res = await request(app).post('/api/v1/billing/portal').set('Cookie', cookie);
      expect(res.status).toBe(400);
    });

    it('invoices returns an empty list when the caller has no Stripe customer yet', async () => {
      const res = await request(app).get('/api/v1/billing/invoices').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.invoices).toEqual([]);
    });

    it('portal returns a url once the caller has a Stripe customer', async () => {
      await db.update(users).set({ stripeCustomerId: 'cus_shared_test' }).where(eq(users.id, userId));

      stripeMock.billingPortal.sessions.create.mockResolvedValueOnce({
        url: 'https://billing.stripe.com/test-portal',
      });

      const res = await request(app).post('/api/v1/billing/portal').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://billing.stripe.com/test-portal');
      expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_shared_test' }),
      );
    });

    it('invoices lists invoices now that the caller has a Stripe customer', async () => {
      stripeMock.invoices.list.mockResolvedValueOnce({
        data: [
          {
            id: 'in_1',
            amount_paid: 1900,
            currency: 'usd',
            status: 'paid',
            created: 1750000000,
            hosted_invoice_url: 'https://invoice.stripe.com/test',
          },
        ],
      });

      const res = await request(app).get('/api/v1/billing/invoices').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.invoices).toEqual([
        {
          id: 'in_1',
          amountPaid: 1900,
          currency: 'usd',
          status: 'paid',
          created: 1750000000,
          hostedInvoiceUrl: 'https://invoice.stripe.com/test',
        },
      ]);
      expect(stripeMock.invoices.list).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_shared_test' }),
      );
    });
  });

  describe('webhook', () => {
    it('rejects a request with no stripe-signature header', async () => {
      const res = await request(app)
        .post('/api/v1/billing/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ any: 'payload' }));
      expect(res.status).toBe(400);
    });

    it('rejects a request with a signature that fails verification', async () => {
      stripeMock.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('signature mismatch');
      });
      const res = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'bad_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ any: 'payload' }));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_SIGNATURE');
    });

    it('checkout.session.completed sets the plan and persists Stripe ids', async () => {
      const { userId } = await signUp(app, `billing-webhook-${randomUUID()}@example.com`);

      stripeMock.webhooks.constructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_webhook_test',
            subscription: 'sub_webhook_test',
            metadata: { user_id: userId, tier: 'pro' },
          },
        },
      });

      const res = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'test_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ any: 'payload' }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });

      const [row] = await db.select().from(users).where(eq(users.id, userId));
      expect(row!.plan).toBe('pro');
      expect(row!.stripeCustomerId).toBe('cus_webhook_test');
      expect(row!.stripeSubscriptionId).toBe('sub_webhook_test');
    });

    it('customer.subscription.deleted resets the plan to free', async () => {
      stripeMock.webhooks.constructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        data: { object: { customer: 'cus_webhook_test' } },
      });

      const res = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'test_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ any: 'payload' }));

      expect(res.status).toBe(200);

      const [row] = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, 'cus_webhook_test'));
      expect(row!.plan).toBe('free');
      expect(row!.stripeSubscriptionId).toBeNull();
    });

    it('an unhandled event type still returns 200 (no-op)', async () => {
      stripeMock.webhooks.constructEvent.mockReturnValueOnce({
        type: 'invoice.payment_failed',
        data: { object: {} },
      });

      const res = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'test_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ any: 'payload' }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });
    });
  });
});
