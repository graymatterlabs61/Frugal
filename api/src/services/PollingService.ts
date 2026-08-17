import { ConnectionRepository } from '../repositories/ConnectionRepository.js';
import { UsageRepository } from '../repositories/UsageRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { decrypt } from '../utils/encryption.js';
import { fetchOpenAiUsage } from '../providers/openai.js';
import { fetchAnthropicUsage } from '../providers/anthropic.js';
import { costUsd } from '../providers/pricing.js';
import { todayUtcRange } from '../providers/types.js';
import { ProviderAuthError } from '../providers/errors.js';
import { BudgetCheckerService } from './BudgetCheckerService.js';
import { logger } from '../utils/logger.js';
import type { apiConnections, ConnectionStatus } from '../db/schema.js';

type Connection = typeof apiConnections.$inferSelect;

/**
 * Only notifies on a STATUS TRANSITION (e.g. active -> invalid, or invalid -> active),
 * never on every poll while a connection stays in the same broken state — otherwise a
 * dead connection would spam a notification every 5 minutes forever.
 */
async function notifyStatusChange(connection: Connection, newStatus: ConnectionStatus): Promise<void> {
  if (newStatus === connection.status) return;

  const isRestored = newStatus === 'active';
  const title = isRestored ? 'Connection restored' : 'Connection needs attention';
  const message = isRestored
    ? `Your ${connection.provider} connection is polling again.`
    : newStatus === 'invalid'
      ? `Your ${connection.provider} connection's key was rejected. Delete and recreate it to resume tracking.`
      : `Your ${connection.provider} connection failed to poll. We'll keep retrying.`;

  try {
    await NotificationRepository.create({
      userId: connection.userId,
      type: isRestored ? 'connection_restored' : 'connection_error',
      title,
      message,
    });
  } catch (err) {
    logger.warn({ connectionId: connection.id, err }, 'failed to write connection status notification');
  }
}

export interface PollResult {
  connectionId: string;
  provider: string;
  status: 'polled' | 'auth_error' | 'error';
  modelsUpdated: number;
}

async function pollOne(connection: Connection): Promise<PollResult> {
  const range = todayUtcRange();
  const date = range.start.toISOString().slice(0, 10);

  try {
    const apiKey = decrypt(connection.apiKeyEncrypted);
    const rows =
      connection.provider === 'openai'
        ? await fetchOpenAiUsage(apiKey, range)
        : await fetchAnthropicUsage(apiKey, range);

    await UsageRepository.upsertDailyUsage(
      connection.id,
      connection.userId,
      date,
      rows.map((r) => ({ ...r, costUsd: costUsd(r.model, r.tokensInput, r.tokensOutput) })),
    );
    await notifyStatusChange(connection, 'active');
    await ConnectionRepository.markPollResult(connection.id, 'active', new Date());

    try {
      await BudgetCheckerService.checkProject(connection.projectId);
    } catch (err) {
      logger.warn({ connectionId: connection.id, err }, 'budget check failed after poll');
    }

    return {
      connectionId: connection.id,
      provider: connection.provider,
      status: 'polled',
      modelsUpdated: rows.length,
    };
  } catch (err) {
    const isAuthError = err instanceof ProviderAuthError;
    const newStatus: ConnectionStatus = isAuthError ? 'invalid' : 'polling_error';
    await notifyStatusChange(connection, newStatus);
    await ConnectionRepository.markPollResult(connection.id, newStatus, new Date());
    logger.warn(
      { connectionId: connection.id, provider: connection.provider, err },
      'poll failed for connection',
    );
    return {
      connectionId: connection.id,
      provider: connection.provider,
      status: isAuthError ? 'auth_error' : 'error',
      modelsUpdated: 0,
    };
  }
}

export const PollingService = {
  async pollConnectionsForUser(userId: string): Promise<PollResult[]> {
    const connections = await ConnectionRepository.listPollableForUser(userId);
    return Promise.all(connections.map(pollOne));
  },

  async pollAllActiveConnections(): Promise<PollResult[]> {
    const connections = await ConnectionRepository.listAllPollable();
    return Promise.all(connections.map(pollOne));
  },
};
