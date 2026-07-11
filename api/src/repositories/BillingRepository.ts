import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/authSchema.js';
import type { PlanTier } from '../utils/tier.js';

export const BillingRepository = {
  async findById(userId: string) {
    const [row] = await db.select().from(users).where(eq(users.id, userId));
    return row;
  },

  async setStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
  },

  async syncSubscription(
    stripeCustomerId: string,
    data: { plan: PlanTier; stripeSubscriptionId: string | null },
  ): Promise<void> {
    await db
      .update(users)
      .set({ plan: data.plan, stripeSubscriptionId: data.stripeSubscriptionId })
      .where(eq(users.stripeCustomerId, stripeCustomerId));
  },
};
