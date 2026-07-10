import { describe, it, expect } from 'vitest';
import { limitFor } from '../../src/utils/tier.js';

describe('limitFor', () => {
  it('returns free-tier limits for the free plan', () => {
    expect(limitFor('free', 'projects')).toBe(1);
    expect(limitFor('free', 'connections')).toBe(1);
  });

  it('returns plus-tier limits', () => {
    expect(limitFor('plus', 'projects')).toBe(5);
    expect(limitFor('plus', 'connections')).toBe(3);
  });

  it('returns Infinity for pro and every corp/enterprise plan', () => {
    for (const plan of ['pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise']) {
      expect(limitFor(plan, 'projects')).toBe(Infinity);
      expect(limitFor(plan, 'connections')).toBe(Infinity);
    }
  });

  it('defaults to free-tier limits for unknown or undefined plans', () => {
    expect(limitFor(undefined, 'projects')).toBe(1);
    expect(limitFor('nonsense', 'connections')).toBe(1);
  });
});
