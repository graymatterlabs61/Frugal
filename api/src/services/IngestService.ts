import { IngestRepository } from '../repositories/IngestRepository.js';
import { BudgetCheckerService } from './BudgetCheckerService.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { Provider } from '../db/schema.js';

// Per spec §4: programmatic ingest is a Pro-and-up feature (Free/Plus get 403).
const INGEST_ALLOWED_PLANS = new Set(['pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise']);

export const IngestService = {
  async create(
    userId: string,
    userPlan: string | undefined,
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
    // Tier gate first (no DB round-trip, doesn't disclose whether the project exists).
    if (!userPlan || !INGEST_ALLOWED_PLANS.has(userPlan)) {
      throw new ForbiddenError('Programmatic ingest requires the Pro plan');
    }

    const project = await IngestRepository.findProjectForUser(data.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    const event = await IngestRepository.create(userId, data);

    try {
      await BudgetCheckerService.checkProject(data.projectId);
    } catch (err) {
      logger.warn({ projectId: data.projectId, err }, 'budget check failed after ingest');
    }

    return event;
  },
};
