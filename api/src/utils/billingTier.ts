import { config } from '../config/unifiedConfig.js';

export type BillableTier = 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'yearly';

/** POST /billing/checkout looks up the Stripe price for the requested tier+interval. */
export function priceIdFor(tier: BillableTier, interval: BillingInterval): string {
  const priceId =
    tier === 'plus'
      ? interval === 'monthly'
        ? config.stripe.pricePlusMonthly
        : config.stripe.pricePlusYearly
      : interval === 'monthly'
        ? config.stripe.priceProMonthly
        : config.stripe.priceProYearly;

  if (!priceId) throw new Error(`No Stripe price configured for ${tier}/${interval}`);
  return priceId;
}

/** Reverse lookup — the webhook syncs `users.plan` from a subscription's active price. */
export function tierForPriceId(priceId: string): BillableTier | undefined {
  if (priceId === config.stripe.pricePlusMonthly || priceId === config.stripe.pricePlusYearly) {
    return 'plus';
  }
  if (priceId === config.stripe.priceProMonthly || priceId === config.stripe.priceProYearly) {
    return 'pro';
  }
  return undefined;
}
