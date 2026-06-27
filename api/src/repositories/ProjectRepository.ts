import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { projects, type Project, type NewProject } from '@/db/schema';

export class ProjectRepository {
  async findAllByUser(userId: string): Promise<Project[]> {
    return db.query.projects.findMany({ where: eq(projects.userId, userId) });
  }

  async findById(id: string): Promise<Project | undefined> {
    return db.query.projects.findFirst({ where: eq(projects.id, id) });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Project | undefined> {
    return db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, userId)),
    });
  }

  async countByUser(userId: string): Promise<number> {
    const rows = await db.query.projects.findMany({ where: eq(projects.userId, userId) });
    return rows.length;
  }

  async create(data: NewProject): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async update(id: string, data: Partial<NewProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}