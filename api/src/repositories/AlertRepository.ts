import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { alertLog, type AlertStatus } from '../db/schema.js';

export const AlertRepository = {
  async listForUser(userId: string) {
    return db.select().from(alertLog).where(eq(alertLog.userId, userId));
  },

  async update(id: string, userId: string, status: AlertStatus) {
    const [row] = await db
      .update(alertLog)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      })
      .where(and(eq(alertLog.id, id), eq(alertLog.userId, userId)))
      .returning();
    return row;
  },
};
