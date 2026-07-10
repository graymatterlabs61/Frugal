import { eq, and, count } from 'drizzle-orm';
import { db } from '../db/client.js';
import { apiConnections, projects, type Provider } from '../db/schema.js';

export const ConnectionRepository = {
  async listForUser(userId: string) {
    return db.select().from(apiConnections).where(eq(apiConnections.userId, userId));
  },

  async countForUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(apiConnections)
      .where(eq(apiConnections.userId, userId));
    return Number(row?.value ?? 0);
  },

  async findProjectForUser(projectId: string, userId: string) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    return row;
  },

  async findByIdForUser(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(apiConnections)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)));
    return row;
  },

  async create(
    userId: string,
    data: {
      projectId: string;
      provider: Provider;
      label?: string | undefined;
      apiKeyEncrypted: string;
      apiKeySuffix: string;
    },
  ) {
    const [row] = await db
      .insert(apiConnections)
      .values({
        userId,
        projectId: data.projectId,
        provider: data.provider,
        label: data.label,
        apiKeyEncrypted: data.apiKeyEncrypted,
        apiKeySuffix: data.apiKeySuffix,
      })
      .returning();
    return row!;
  },

  async update(
    id: string,
    userId: string,
    data: { label?: string | undefined; isActive?: boolean | undefined },
  ) {
    const [row] = await db
      .update(apiConnections)
      .set(data)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(apiConnections)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
      .returning({ id: apiConnections.id });
    return result.length > 0;
  },
};
