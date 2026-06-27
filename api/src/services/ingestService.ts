import * as Sentry from '@sentry/node';
import { IngestRepository } from '@/repositories/IngestRepository';
import { BudgetService } from './budgetService';
import { BudgetRepository, AlertRepository, NotificationRepository } from '@/repositories/BudgetRepository';
import { UsageRepository } from '@/repositories/UsageRepository';
import { logger } from '@/utils/logger';
import type { IngestInput } from '@/validators/ingest.schema';

const budgetService = new BudgetService(
  new BudgetRepository(),
  new AlertRepository(),
  new NotificationRepository(),
  new UsageRepository(),
);

export class IngestService {
  constructor(private readonly ingestRepository: IngestRepository) {}

  async ingest(userId: string, input: IngestInput): Promise<void> {
    await this.ingestRepository.create({
      userId,
      endUserId: input.endUserId,
      projectId: input.projectId ?? null,
      provider: input.provider ?? null,
      model: input.model ?? null,
      tokensInput: input.tokensInput,
      tokensOutput: input.tokensOutput,
      costUsd: input.costUsd.toFixed(6),
      metadata: input.metadata ?? null,
    });

    // Non-blocking budget check — failures are captured, never thrown
    budgetService
      .checkBudgetForProject(userId, input.projectId ?? '')
      .catch((err) => {
        Sentry.captureException(err, { extra: { userId, projectId: input.projectId } });
        logger.error({ err, userId, projectId: input.projectId }, 'Budget check failed after ingest');
      });
  }
}