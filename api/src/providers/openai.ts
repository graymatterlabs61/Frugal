import { ProviderAuthError, ProviderRequestError } from './errors.js';
import type { ProviderUsageRow } from './types.js';

const OPENAI_USAGE_URL = 'https://api.openai.com/v1/organization/usage/completions';

interface OpenAiUsageResponse {
  data: Array<{
    results: Array<{ model: string | null; input_tokens: number; output_tokens: number }>;
  }>;
}

export async function fetchOpenAiUsage(
  adminKey: string,
  range: { start: Date; end: Date },
): Promise<ProviderUsageRow[]> {
  const url = new URL(OPENAI_USAGE_URL);
  url.searchParams.set('start_time', String(Math.floor(range.start.getTime() / 1000)));
  url.searchParams.set('end_time', String(Math.floor(range.end.getTime() / 1000)));
  url.searchParams.set('bucket_width', '1d');
  url.searchParams.set('group_by', 'model');

  const res = await fetch(url, { headers: { Authorization: `Bearer ${adminKey}` } });

  if (res.status === 401 || res.status === 403) {
    throw new ProviderAuthError(`OpenAI rejected the admin key (${res.status})`);
  }
  if (!res.ok) {
    throw new ProviderRequestError(`OpenAI usage request failed: ${res.status}`);
  }

  const body = (await res.json()) as OpenAiUsageResponse;
  const totals = new Map<string, { tokensInput: number; tokensOutput: number }>();
  for (const bucket of body.data) {
    for (const result of bucket.results) {
      if (!result.model) continue;
      const current = totals.get(result.model) ?? { tokensInput: 0, tokensOutput: 0 };
      current.tokensInput += result.input_tokens;
      current.tokensOutput += result.output_tokens;
      totals.set(result.model, current);
    }
  }
  return [...totals.entries()].map(([model, t]) => ({ model, ...t }));
}
