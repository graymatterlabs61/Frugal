import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { apiConnections, type ApiConnection, type NewApiConnection } from '@/db/schema';

export class ConnectionRepository {
  async findAllByUser(userId: string): Promise<ApiConnection[]> {
    return db.query.apiConnections.findMany({ where: eq(apiConnections.userId, userId) });
  }

  async findAllActive(): Promise<ApiConnection[]> {
    return db.query.apiConnections.findMany({
      where: and(
        eq(apiConnections.isActive, true),
        eq(apiConnections.status, 'active'),
      ),
    });
  }

  async findById(id: string): Promise<ApiConnection | undefined> {
    return db.query.apiConnections.findFirst({ where: eq(apiConnections.id, id) });
  }

  async findByIdAndUser(id: string, userId: string): Promise<ApiConnection | undefined> {
    return db.query.apiConnections.findFirst({
      where: and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)),
    });
  }

  async countByUser(userId: string): Promise<number> {
    const rows = await db.query.apiConnections.findMany({
      where: eq(apiConnections.userId, userId),
    });
    return rows.length;
  }

  async create(data: NewApiConnection): Promise<ApiConnection> {
    const [conn] = await db.insert(apiConnections).values(data).returning();
    return conn;
  }

  async update(id: string, data: Partial<NewApiConnection>): Promise<ApiConnection> {
    const [conn] = await db
      .update(apiConnections)
      .set(data)
      .where(eq(apiConnections.id, id))
      .returning();
    return conn;
  }

  async delete(id: string): Promise<void> {
    await db.delete(apiConnections).where(eq(apiConnections.id, id));
  }

  async updateLastPolled(id: string, status: ApiConnection['status']): Promise<void> {
    await db
      .update(apiConnections)
      .set({ lastPolledAt: new Date(), status })
      .where(eq(apiConnections.id, id));
  }
}