import { and, count, eq } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { projects } from "../db/schema.js";

export type ProjectRow = typeof projects.$inferSelect;
type CreateProjectData = { name: string; description?: string; color?: string };
type UpdateProjectData = Partial<CreateProjectData> & { slackWebhookUrl?: string };

export class ProjectRepository {
  constructor(private readonly db: Db) {}

  async findAllByUser(userId: string): Promise<ProjectRow[]> {
    return this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.createdAt);
  }

  /** Returns null if the project does not exist or is not owned by userId. */
  async findById(userId: string, projectId: string): Promise<ProjectRow | null> {
    const rows = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(userId: string, data: CreateProjectData): Promise<ProjectRow> {
    const rows = await this.db
      .insert(projects)
      .values({
        userId,
        name: data.name,
        description: data.description ?? null,
        color: data.color ?? "slate",
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create project");
    return row;
  }

  async update(
    userId: string,
    projectId: string,
    data: UpdateProjectData
  ): Promise<ProjectRow | null> {
    const toSet: Partial<typeof projects.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (data.name !== undefined) toSet.name = data.name;
    if (data.description !== undefined) toSet.description = data.description;
    if (data.color !== undefined) toSet.color = data.color;
    if (data.slackWebhookUrl !== undefined) toSet.slackWebhookUrl = data.slackWebhookUrl;

    const rows = await this.db
      .update(projects)
      .set(toSet)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();
    return rows[0] ?? null;
  }

  /** Returns false if the project was not found or not owned by userId. */
  async delete(userId: string, projectId: string): Promise<boolean> {
    const rows = await this.db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    return rows.length > 0;
  }

  async countByUser(userId: string): Promise<number> {
    const rows = await this.db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, userId));
    return rows[0]?.count ?? 0;
  }
}
