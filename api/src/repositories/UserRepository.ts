import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users, type User, type NewUser } from '../db/schema.js';
import { NotFoundError } from '../utils/errors.js';

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user!;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
