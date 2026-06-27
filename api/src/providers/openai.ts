import type { Provider, DailyUsage } from './types';
import { AppError } from '@/utils/errors';

const OPENAI_API_VERSION = '2024-10-21';

export const openaiProvider: Provider = {
  name: 'openai',

  async validateKey(apiKey: string): Promise<void> {
    const res = await fetch('https://api.openai.com/v1/models?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Version': OPENAI_API_VERSION,
      },
    });
    if (res.status === 401) throw new AppError('INVALID_API_KEY', 'Invalid OpenAI API key', 400);
    if (!res.ok) throw new AppError('PROVIDER_ERROR', 'Failed to validate OpenAI key', 502);
  },

  async fetchUsage(apiKey: string, since: Date): Promise<DailyUsage[]> {
    const startDate = since.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const res = await fetch(
      `https://api.openai.com/v1/usage?date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Version': OPENAI_API_VERSION,
        },
      },
    );

    if (!res.ok) {
      throw new AppError('PROVIDER_ERROR', `OpenAI usage fetch failed: ${res.status}`, 502);
    }

    const data = (await res.json()) as {
      data?: Array<{
        aggregation_timestamp: number;
        model_id: string;
        n_context_tokens_total: number;
        n_generated_tokens_total: number;
      }>;
    };

    if (!data.data) return [];

    return data.data.map((row) => {
      const date = new Date(row.aggregation_timestamp * 1000).toISOString().split('T')[0];
      const tokensInput = row.n_context_tokens_total ?? 0;
      const tokensOutput = row.n_generated_tokens_total ?? 0;
      const costUsd = estimateOpenAICost(row.model_id, tokensInput, tokensOutput);

      return { date, model: row.model_id, tokensInput, tokensOutput, costUsd };
    });
  },
};

function estimateOpenAICost(model: string, input: number, output: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0000025, output: 0.00001 },
    'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 },
    'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 },
  };

  const rate = Object.entries(rates).find(([key]) => model.startsWith(key))?.[1];
  if (!rate) return 0;
  return input * rate.input + output * rate.output;
}