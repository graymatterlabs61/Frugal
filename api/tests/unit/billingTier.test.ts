import { describe, it, expect } from 'vitest';
import { priceIdFor, tierForPriceId } from '../../src/utils/billingTier.js';

describe('priceIdFor', () => {
  it('resolves plus monthly/yearly to the configured price ids', () => {
    expect(priceIdFor('plus', 'monthly')).toBe('price_plus_monthly_test');
    expect(priceIdFor('plus', 'yearly')).toBe('price_plus_yearly_test');
  });

  it('resolves pro monthly/yearly to the configured price ids', () => {
    expect(priceIdFor('pro', 'monthly')).toBe('price_pro_monthly_test');
    expect(priceIdFor('pro', 'yearly')).toBe('price_pro_yearly_test');
  });
});

describe('tierForPriceId', () => {
  it('maps a known plus price id back to plus', () => {
    expect(tierForPriceId('price_plus_monthly_test')).toBe('plus');
    expect(tierForPriceId('price_plus_yearly_test')).toBe('plus');
  });

  it('maps a known pro price id back to pro', () => {
    expect(tierForPriceId('price_pro_monthly_test')).toBe('pro');
    expect(tierForPriceId('price_pro_yearly_test')).toBe('pro');
  });

  it('returns undefined for an unrecognized price id', () => {
    expect(tierForPriceId('price_unknown')).toBeUndefined();
  });
});
