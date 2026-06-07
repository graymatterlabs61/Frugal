export interface ProviderUsageRecord {
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

export interface FetchUsageResult {
  supported: boolean;
  records: ProviderUsageRecord[];
  error?: string;
}

export interface Connection {
  id: string;
  user_id: string;
  provider: string;
  api_key_encrypted: string;
  project_id: string | null;
  status: string;
}

export interface BudgetRule {
  id: string;
  project_id: string;
  user_id: string;
  period: "daily" | "monthly";
  limit_usd: number;
  alert_at_percent: number;
  action: string;
  is_active: boolean;
}

export interface WorkerResult {
  processed: number;
  errors: number;
  alertsFired: number;
}
