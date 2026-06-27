export interface DailyUsage {
  date: string;           // YYYY-MM-DD
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

export interface Provider {
  name: string;
  validateKey(apiKey: string): Promise<void>;
  fetchUsage(apiKey: string, since: Date): Promise<DailyUsage[]>;
}