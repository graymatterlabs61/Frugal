import { ConnectionRepository } from '../repositories/ConnectionRepository.js';
import { UsageRepository } from '../repositories/UsageRepository.js';
import { decrypt } from '../utils/encryption.js';
import { fetchOpenAiUsage } from '../providers/openai.js';
import { fetchAnthropicUsage } from '../providers/anthropic.js';
import { costUsd } from '../providers/pricing.js';
import { todayUtcRange } from '../providers/types.js';
import { ProviderAuthError } from '../providers/errors.js';
import { logger } from '../utils/logger.js';
import type { apiConnections } from '../db/schema.js';

type Connection = typeof apiConnections.$inferSelect;

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
    await ConnectionRepository.markPollResult(connection.id, 'active', new Date());
    return {
      connectionId: connection.id,
      provider: connection.provider,
      status: 'polled',
      modelsUpdated: rows.length,
    };
  } catch (err) {
    const isAuthError = err instanceof ProviderAuthError;
    await ConnectionRepository.markPollResult(
      connection.id,
      isAuthError ? 'invalid' : 'polling_error',
      new Date(),
    );
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
