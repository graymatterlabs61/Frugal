import Stripe from 'stripe';
import { config } from '../config/unifiedConfig.js';

let _stripe: Stripe | null = null;

/** Lazy-initialized so import-time (build/typecheck) never requires STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!config.stripe.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2026-06-24.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}
