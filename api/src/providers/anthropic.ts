import type { Provider, DailyUsage } from './types';
import { AppError } from '@/utils/errors';

const ANTHROPIC_API_VERSION = '2023-06-01';

export const anthropicProvider: Provider = {
  name: 'anthropic',

  async validateKey(apiKey: string): Promise<void> {
    const res = await fetch('https://api.anthropic.com/v1/models?limit=1', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
    });
    if (res.status === 401) throw new AppError('INVALID_API_KEY', 'Invalid Anthropic API key', 400);
    if (!res.ok) throw new AppError('PROVIDER_ERROR', 'Failed to validate Anthropic key', 502);
  },

  async fetchUsage(apiKey: string, since: Date): Promise<DailyUsage[]> {
    const startDate = since.toISOString().split('T')[0];

    const res = await fetch(
      `https://api.anthropic.com/v1/usage?start_date=${startDate}`,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_API_VERSION,
        },
      },
    );

    if (!res.ok) {
      throw new AppError('PROVIDER_ERROR', `Anthropic usage fetch failed: ${res.status}`, 502);
    }

    const data = (await res.json()) as {
      data?: Array<{
        timestamp: string;
        model: string;
        input_tokens: number;
        output_tokens: number;
        cost_usd?: number;
      }>;
    };

    if (!data.data) return [];

    return data.data.map((row) => ({
      date: row.timestamp.split('T')[0],
      model: row.model,
      tokensInput: row.input_tokens ?? 0,
      tokensOutput: row.output_tokens ?? 0,
      costUsd: row.cost_usd ?? estimateAnthropicCost(row.model, row.input_tokens, row.output_tokens),
    }));
  },
};

function estimateAnthropicCost(model: string, input: number, output: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'claude-opus-4': { input: 0.000015, output: 0.000075 },
    'claude-sonnet-4': { input: 0.000003, output: 0.000015 },
    'claude-haiku-4': { input: 0.00000025, output: 0.00000125 },
    'claude-3-5-sonnet': { input: 0.000003, output: 0.000015 },
    'claude-3-5-haiku': { input: 0.0000008, output: 0.000004 },
  };

  const rate = Object.entries(rates).find(([key]) => model.startsWith(key))?.[1];
  if (!rate) return 0;
  return input * rate.input + output * rate.output;
}