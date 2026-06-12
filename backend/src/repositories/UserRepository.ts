import { eq } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { Plan } from "../utils/tier.js";

export type UserRow = typeof users.$inferSelect;
type NewUserData = { email: string; passwordHash?: string | null; googleId?: string | null; fullName?: string };
type UpdateProfileData = { fullName?: string; email?: string };

export class UserRepository {
  constructor(private readonly db: Db) {}

  async findById(userId: string): Promise<UserRow | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: NewUserData): Promise<UserRow> {
    const rows = await this.db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        googleId: data.googleId ?? null,
        fullName: data.fullName ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create user");
    return row;
  }

  async findByGoogleId(googleId: string): Promise<UserRow | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return rows[0] ?? null;
  }

  async findOrCreateGoogleUser(googleId: string, email: string, fullName: string): Promise<UserRow> {
    // 1. Find by googleId
    const byGoogleId = await this.findByGoogleId(googleId);
    if (byGoogleId) return byGoogleId;

    // 2. Find by email — if found, attach googleId
    const byEmail = await this.findByEmail(email);
    if (byEmail) {
      const rows = await this.db
        .update(users)
        .set({ googleId, updatedAt: new Date() })
        .where(eq(users.id, byEmail.id))
        .returning();
      const row = rows[0];
      if (!row) throw new Error("Failed to update user with googleId");
      return row;
    }

    // 3. Create brand-new user (no password)
    return this.create({ email, googleId, fullName, passwordHash: null });
  }

  async updateStripeSubscription(
    userId: string,
    subscriptionId: string | null,
    plan: Plan
  ): Promise<void> {
    await this.db
      .update(users)
      .set({ stripeSubscriptionId: subscriptionId, plan, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePlan(userId: string, plan: Plan): Promise<void> {
    await this.db
      .update(users)
      .set({ plan, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserRow> {
    const toSet: Partial<typeof users.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (data.fullName !== undefined) toSet.fullName = data.fullName;
    if (data.email !== undefined) toSet.email = data.email;

    const rows = await this.db
      .update(users)
      .set(toSet)
      .where(eq(users.id, userId))
      .returning();
    const row = rows[0];
    if (!row) throw new Error("User not found");
    return row;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
