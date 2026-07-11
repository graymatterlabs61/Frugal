import { ProviderAuthError, ProviderRequestError } from './errors.js';
import type { ProviderUsageRow } from './types.js';

const ANTHROPIC_USAGE_URL = 'https://api.anthropic.com/v1/organizations/usage_report/messages';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicUsageResponse {
  data: Array<{
    results: Array<{
      model: string | null;
      uncached_input_tokens: number;
      cache_read_input_tokens: number;
      output_tokens: number;
    }>;
  }>;
}

export async function fetchAnthropicUsage(
  adminKey: string,
  range: { start: Date; end: Date },
): Promise<ProviderUsageRow[]> {
  const url = new URL(ANTHROPIC_USAGE_URL);
  url.searchParams.set('starting_at', range.start.toISOString());
  url.searchParams.set('ending_at', range.end.toISOString());
  url.searchParams.set('bucket_width', '1d');
  url.searchParams.set('group_by', 'model');

  const res = await fetch(url, {
    headers: { 'x-api-key': adminKey, 'anthropic-version': ANTHROPIC_VERSION },
  });

  if (res.status === 401 || res.status === 403) {
    throw new ProviderAuthError(`Anthropic rejected the admin key (${res.status})`);
  }
  if (!res.ok) {
    throw new ProviderRequestError(`Anthropic usage request failed: ${res.status}`);
  }

  const body = (await res.json()) as AnthropicUsageResponse;
  const totals = new Map<string, { tokensInput: number; tokensOutput: number }>();
  for (const bucket of body.data) {
    for (const result of bucket.results) {
      if (!result.model) continue;
      const current = totals.get(result.model) ?? { tokensInput: 0, tokensOutput: 0 };
      current.tokensInput += result.uncached_input_tokens + result.cache_read_input_tokens;
      current.tokensOutput += result.output_tokens;
      totals.set(result.model, current);
    }
  }
  return [...totals.entries()].map(([model, t]) => ({ model, ...t }));
}
