import { logger } from '../utils/logger.js';

interface PricingRate {
  prefix: string;
  inputPer1M: number;
  outputPer1M: number;
}

// Verified July 2026 — see spec §6 for source links. Providers change pricing/models
// without notice; this table needs manual upkeep when they do.
const RATES: PricingRate[] = [
  { prefix: 'gpt-4.1-nano', inputPer1M: 0.1, outputPer1M: 0.4 },
  { prefix: 'gpt-4.1-mini', inputPer1M: 0.4, outputPer1M: 1.6 },
  { prefix: 'gpt-4.1', inputPer1M: 2.0, outputPer1M: 8.0 },
  { prefix: 'gpt-4o-mini', inputPer1M: 0.15, outputPer1M: 0.6 },
  { prefix: 'gpt-4o', inputPer1M: 2.5, outputPer1M: 10.0 },
  { prefix: 'claude-opus-4', inputPer1M: 5.0, outputPer1M: 25.0 },
  // intro pricing thru 2026-08-31; standard $3/$15 takes effect after — update at cutover
  { prefix: 'claude-sonnet-5', inputPer1M: 2.0, outputPer1M: 10.0 },
  { prefix: 'claude-sonnet-4', inputPer1M: 3.0, outputPer1M: 15.0 },
  { prefix: 'claude-haiku-4', inputPer1M: 1.0, outputPer1M: 5.0 },
].sort((a, b) => b.prefix.length - a.prefix.length);

export function costUsd(model: string, tokensInput: number, tokensOutput: number): number {
  const rate = RATES.find((r) => model.startsWith(r.prefix));
  if (!rate) {
    logger.warn({ model }, 'no pricing rate for model, defaulting cost to 0');
    return 0;
  }
  return (tokensInput / 1_000_000) * rate.inputPer1M + (tokensOutput / 1_000_000) * rate.outputPer1M;
}
