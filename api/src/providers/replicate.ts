import type { Provider, DailyUsage } from './types';
import { AppError } from '@/utils/errors';

export const replicateProvider: Provider = {
  name: 'replicate',

  async validateKey(apiKey: string): Promise<void> {
    const res = await fetch('https://api.replicate.com/v1/account', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401) throw new AppError('INVALID_API_KEY', 'Invalid Replicate API key', 400);
    if (!res.ok) throw new AppError('PROVIDER_ERROR', 'Failed to validate Replicate key', 502);
  },

  async fetchUsage(apiKey: string, since: Date): Promise<DailyUsage[]> {
    const usageByDay = new Map<string, DailyUsage>();

    let cursor: string | undefined;

    while (true) {
      const url = new URL('https://api.replicate.com/v1/predictions');
      if (cursor) url.searchParams.set('cursor', cursor);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!res.ok) break;

      const data = (await res.json()) as {
        results?: Array<{
          created_at?: string;
          model?: string;
          metrics?: { predict_time?: number };
          urls?: { get?: string };
        }>;
        next?: string;
      };

      if (!data.results) break;

      let reachedLimit = false;
      for (const pred of data.results) {
        if (!pred.created_at) continue;
        const createdAt = new Date(pred.created_at);
        if (createdAt < since) { reachedLimit = true; break; }

        const date = createdAt.toISOString().split('T')[0];
        const model = pred.model ?? 'unknown';
        const key = `${date}:${model}`;

        if (!usageByDay.has(key)) {
          usageByDay.set(key, { date, model, tokensInput: 0, tokensOutput: 0, costUsd: 0 });
        }
        // Replicate bills by compute time — approximated
        const entry = usageByDay.get(key)!;
        entry.costUsd += (pred.metrics?.predict_time ?? 0) * 0.0001;
      }

      if (reachedLimit || !data.next) break;
      cursor = data.next;
    }

    return Array.from(usageByDay.values());
  },
};