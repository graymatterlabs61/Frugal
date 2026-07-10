import { eq, and, count } from 'drizzle-orm';
import { db } from '../db/client.js';
import { projects } from '../db/schema.js';

export const ProjectRepository = {
  async listForUser(userId: string) {
    return db.select().from(projects).where(eq(projects.userId, userId));
  },

  async countForUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.userId, userId));
    return Number(row?.value ?? 0);
  },

  async findByIdForUser(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return row;
  },

  async create(
    userId: string,
    data: { name: string; description?: string | undefined; color?: string | undefined },
  ) {
    const [row] = await db
      .insert(projects)
      .values({ userId, name: data.name, description: data.description, color: data.color })
      .returning();
    return row!;
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string | undefined; description?: string | undefined; color?: string | undefined },
  ) {
    const [row] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    return result.length > 0;
  },
};
