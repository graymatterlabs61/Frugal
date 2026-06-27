import { db } from '@/db/client';
import { ingestEvents, type IngestEvent } from '@/db/schema';

export interface CreateIngestEventData {
  userId: string;
  endUserId: string;
  projectId?: string | null;
  provider?: 'openai' | 'anthropic' | 'replicate' | 'falai' | 'gemini' | null;
  model?: string | null;
  tokensInput: number;
  tokensOutput: number;
  costUsd: string;
  metadata?: unknown | null;
}

export class IngestRepository {
  async create(data: CreateIngestEventData): Promise<IngestEvent> {
    const [event] = await db.insert(ingestEvents).values(data).returning();
    return event;
  }
}