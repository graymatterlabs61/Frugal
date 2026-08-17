import { describe, it, expect } from 'vitest';
import { alertChannelsFor } from '../../src/utils/alertChannelTier.js';

describe('alertChannelsFor', () => {
  it('free plan gets email only', () => {
    expect(alertChannelsFor('free')).toEqual(['email']);
  });

  it('plus plan gets email + slack, not webhook', () => {
    expect(alertChannelsFor('plus')).toEqual(['email', 'slack']);
  });

  it('pro and corp/enterprise plans get all three channels', () => {
    for (const plan of ['pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise']) {
      expect(alertChannelsFor(plan)).toEqual(['email', 'slack', 'webhook']);
    }
  });

  it('defaults to free-tier channels for unknown or undefined plans', () => {
    expect(alertChannelsFor(undefined)).toEqual(['email']);
    expect(alertChannelsFor('nonsense')).toEqual(['email']);
  });
});
