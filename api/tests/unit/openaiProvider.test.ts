import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchOpenAiUsage } from '../../src/providers/openai.js';
import { ProviderAuthError, ProviderRequestError } from '../../src/providers/errors.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const range = { start: new Date('2026-07-11T00:00:00Z'), end: new Date('2026-07-11T12:00:00Z') };

describe('fetchOpenAiUsage', () => {
  it('requests the completions usage endpoint grouped by model and parses results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            results: [
              { model: 'gpt-4.1', input_tokens: 1000, output_tokens: 200 },
              { model: 'gpt-4.1-mini', input_tokens: 500, output_tokens: 100 },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchOpenAiUsage('sk-admin-test', range);

    expect(rows).toEqual([
      { model: 'gpt-4.1', tokensInput: 1000, tokensOutput: 200 },
      { model: 'gpt-4.1-mini', tokensInput: 500, tokensOutput: 100 },
    ]);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      'https://api.openai.com/v1/organization/usage/completions',
    );
    expect(calledUrl.searchParams.get('bucket_width')).toBe('1d');
    expect(calledUrl.searchParams.get('group_by')).toBe('model');
    expect(calledUrl.searchParams.get('start_time')).toBe('1783728000');
    expect(calledInit.headers).toMatchObject({ Authorization: 'Bearer sk-admin-test' });
  });

  it('throws ProviderAuthError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('bad-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderAuthError on 403 (key lacks admin scope)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('non-admin-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderRequestError on 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('sk-admin-test', range)).rejects.toThrow(ProviderRequestError);
  });
});
