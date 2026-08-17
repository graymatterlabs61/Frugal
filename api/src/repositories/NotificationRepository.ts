import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notifications } from '../db/schema.js';

export const NotificationRepository = {
  async listForUser(userId: string) {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  },

  async markRead(id: string, userId: string) {
    const [row] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return row;
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  },

  /** System-side — budgetChecker writes these; no HTTP endpoint creates them. */
  async create(data: { userId: string; type: string; title: string; message: string }) {
    const [row] = await db.insert(notifications).values(data).returning();
    return row!;
  },
};
