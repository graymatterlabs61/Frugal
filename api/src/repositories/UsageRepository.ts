import { db } from '../db/client.js';
import { usageRecords } from '../db/schema.js';
import type { ProviderUsageRow } from '../providers/types.js';

export const UsageRepository = {
  async upsertDailyUsage(
    connectionId: string,
    userId: string,
    date: string,
    rows: Array<ProviderUsageRow & { costUsd: number }>,
  ): Promise<void> {
    for (const row of rows) {
      await db
        .insert(usageRecords)
        .values({
          connectionId,
          userId,
          date,
          model: row.model,
          tokensInput: row.tokensInput,
          tokensOutput: row.tokensOutput,
          costUsd: row.costUsd.toFixed(6),
        })
        .onConflictDoUpdate({
          target: [usageRecords.connectionId, usageRecords.date, usageRecords.model],
          set: {
            tokensInput: row.tokensInput,
            tokensOutput: row.tokensOutput,
            costUsd: row.costUsd.toFixed(6),
          },
        });
    }
  },
};
