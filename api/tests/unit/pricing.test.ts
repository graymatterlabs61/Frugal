import { describe, it, expect } from 'vitest';
import { costUsd } from '../../src/providers/pricing.js';

describe('costUsd', () => {
  it('computes cost for a known OpenAI model', () => {
    expect(costUsd('gpt-4.1', 1_000_000, 1_000_000)).toBeCloseTo(2.0 + 8.0, 5);
  });

  it('prefers the more specific mini rate over the shorter base-model prefix', () => {
    expect(costUsd('gpt-4.1-mini-2026-01-15', 1_000_000, 1_000_000)).toBeCloseTo(0.4 + 1.6, 5);
  });

  it('computes cost for a known Anthropic model', () => {
    expect(costUsd('claude-opus-4-8-20260528', 1_000_000, 1_000_000)).toBeCloseTo(5.0 + 25.0, 5);
  });

  it('computes cost proportionally for partial token counts', () => {
    expect(costUsd('gpt-4o-mini', 500_000, 0)).toBeCloseTo(0.075, 5);
  });

  it('defaults to 0 and does not throw for an unknown model', () => {
    expect(costUsd('some-future-model-nobody-has-priced-yet', 1000, 1000)).toBe(0);
  });
});
