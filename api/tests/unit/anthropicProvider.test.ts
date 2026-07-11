import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchAnthropicUsage } from '../../src/providers/anthropic.js';
import { ProviderAuthError, ProviderRequestError } from '../../src/providers/errors.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const range = { start: new Date('2026-07-11T00:00:00Z'), end: new Date('2026-07-11T12:00:00Z') };

describe('fetchAnthropicUsage', () => {
  it('requests the messages usage report grouped by model and sums cache-read + uncached input tokens', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            results: [
              {
                model: 'claude-opus-4-8-20260528',
                uncached_input_tokens: 1000,
                cache_read_input_tokens: 50,
                output_tokens: 200,
              },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchAnthropicUsage('sk-ant-admin-test', range);

    expect(rows).toEqual([
      { model: 'claude-opus-4-8-20260528', tokensInput: 1050, tokensOutput: 200 },
    ]);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      'https://api.anthropic.com/v1/organizations/usage_report/messages',
    );
    expect(calledUrl.searchParams.get('bucket_width')).toBe('1d');
    expect(calledUrl.searchParams.get('group_by')).toBe('model');
    expect(calledUrl.searchParams.get('starting_at')).toBe('2026-07-11T00:00:00.000Z');
    expect(calledInit.headers).toMatchObject({
      'x-api-key': 'sk-ant-admin-test',
      'anthropic-version': '2023-06-01',
    });
  });

  it('throws ProviderAuthError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(fetchAnthropicUsage('bad-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderRequestError on 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(fetchAnthropicUsage('sk-ant-admin-test', range)).rejects.toThrow(
      ProviderRequestError,
    );
  });
});
