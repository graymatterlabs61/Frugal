import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, type User, type NewUser } from '@/db/schema';

export class UserRepository {
  async findById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.googleId, googleId) });
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findByStripeCustomerId(customerId: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.stripeCustomerId, customerId) });
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}