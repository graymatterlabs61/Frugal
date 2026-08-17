import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { ingestEvents, projects, type Provider } from '../db/schema.js';

export const IngestRepository = {
  async findProjectForUser(projectId: string, userId: string) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    return row;
  },

  async create(
    userId: string,
    data: {
      endUserId: string;
      projectId: string;
      provider?: Provider | undefined;
      model?: string | undefined;
      tokensInput: number;
      tokensOutput: number;
      costUsd: number;
      metadata?: Record<string, unknown> | undefined;
    },
  ) {
    const [row] = await db
      .insert(ingestEvents)
      .values({
        userId,
        endUserId: data.endUserId,
        projectId: data.projectId,
        provider: data.provider,
        model: data.model,
        tokensInput: data.tokensInput,
        tokensOutput: data.tokensOutput,
        costUsd: data.costUsd.toFixed(6),
        metadata: data.metadata,
      })
      .returning();
    return row!;
  },
};
