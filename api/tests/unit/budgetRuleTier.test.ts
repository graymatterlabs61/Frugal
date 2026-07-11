import { describe, it, expect } from 'vitest';
import { isActionAllowed } from '../../src/utils/budgetRuleTier.js';

describe('isActionAllowed', () => {
  it('free plan cannot use any action', () => {
    expect(isActionAllowed('free', 'alert')).toBe(false);
    expect(isActionAllowed('free', 'block')).toBe(false);
    expect(isActionAllowed('free', 'throttle')).toBe(false);
  });

  it('plus and pro allow alert and block but not throttle', () => {
    for (const plan of ['plus', 'pro']) {
      expect(isActionAllowed(plan, 'alert')).toBe(true);
      expect(isActionAllowed(plan, 'block')).toBe(true);
      expect(isActionAllowed(plan, 'throttle')).toBe(false);
    }
  });

  it('corp and enterprise plans allow throttle too', () => {
    for (const plan of ['corp_starter', 'corp_growth', 'corp_scale', 'enterprise']) {
      expect(isActionAllowed(plan, 'alert')).toBe(true);
      expect(isActionAllowed(plan, 'block')).toBe(true);
      expect(isActionAllowed(plan, 'throttle')).toBe(true);
    }
  });

  it('defaults to free-tier (no actions allowed) for unknown or undefined plans', () => {
    expect(isActionAllowed(undefined, 'alert')).toBe(false);
    expect(isActionAllowed('nonsense', 'alert')).toBe(false);
  });
});
