export interface ProviderUsageRow {
  model: string;
  tokensInput: number;
  tokensOutput: number;
}

/** UTC calendar day so far: 00:00:00 today through `now`. */
export function todayUtcRange(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return { start, end: now };
}
