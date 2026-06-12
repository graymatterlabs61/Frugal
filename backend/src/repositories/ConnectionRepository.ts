import { and, count, eq } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { apiConnections } from "../db/schema.js";

export type ConnectionRow = typeof apiConnections.$inferSelect;
type CreateConnectionData = {
  provider: ConnectionRow["provider"];
  label?: string;
  projectId?: string;
  apiKeyEncrypted: string;
  apiKeySuffix?: string;
};

export class ConnectionRepository {
  constructor(private readonly db: Db) {}

  async findAllByUser(userId: string, projectId?: string): Promise<ConnectionRow[]> {
    if (projectId) {
      return this.db
        .select()
        .from(apiConnections)
        .where(
          and(
            eq(apiConnections.userId, userId),
            eq(apiConnections.projectId, projectId)
          )
        )
        .orderBy(apiConnections.createdAt);
    }
    return this.db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.userId, userId))
      .orderBy(apiConnections.createdAt);
  }

  /** Returns null if not found or not owned by userId. */
  async findById(userId: string, connectionId: string): Promise<ConnectionRow | null> {
    const rows = await this.db
      .select()
      .from(apiConnections)
      .where(
        and(
          eq(apiConnections.id, connectionId),
          eq(apiConnections.userId, userId)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Unscoped — for the polling worker only.
   * Returns all connections where isActive = true, including the encrypted key.
   */
  async findAllActiveForPolling(): Promise<ConnectionRow[]> {
    return this.db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.isActive, true));
  }

  async create(userId: string, data: CreateConnectionData): Promise<ConnectionRow> {
    const rows = await this.db
      .insert(apiConnections)
      .values({
        userId,
        provider: data.provider,
        label: data.label ?? null,
        projectId: data.projectId ?? null,
        apiKeyEncrypted: data.apiKeyEncrypted,
        apiKeySuffix: data.apiKeySuffix ?? null,
        status: "active",
        isActive: true,
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create connection");
    return row;
  }

  async updateStatus(
    connectionId: string,
    status: ConnectionRow["status"]
  ): Promise<void> {
    await this.db
      .update(apiConnections)
      .set({ status })
      .where(eq(apiConnections.id, connectionId));
  }

  async updateLastPolled(connectionId: string): Promise<void> {
    await this.db
      .update(apiConnections)
      .set({ lastPolledAt: new Date() })
      .where(eq(apiConnections.id, connectionId));
  }

  /** Returns false if not found or not owned by userId. */
  async delete(userId: string, connectionId: string): Promise<boolean> {
    const rows = await this.db
      .delete(apiConnections)
      .where(
        and(
          eq(apiConnections.id, connectionId),
          eq(apiConnections.userId, userId)
        )
      )
      .returning({ id: apiConnections.id });
    return rows.length > 0;
  }

  async countByUser(userId: string): Promise<number> {
    const rows = await this.db
      .select({ count: count() })
      .from(apiConnections)
      .where(eq(apiConnections.userId, userId));
    return rows[0]?.count ?? 0;
  }
}
