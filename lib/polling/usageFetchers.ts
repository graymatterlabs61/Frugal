import { estimateCost } from "./pricing";
import type { FetchUsageResult, ProviderUsageRecord } from "./types";

const TIMEOUT = 12_000;

// ── OpenAI ────────────────────────────────────────────────────────────────────
// Uses the legacy /v1/usage endpoint — works with standard API keys.
// Returns per-model token counts for a given date (UTC).

interface OpenAIUsageItem {
  snapshot_id: string;
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
  n_requests: number;
}

export async function fetchOpenAIUsage(apiKey: string, date: string): Promise<FetchUsageResult> {
  try {
    const res = await fetch(`https://api.openai.com/v1/usage?date=${date}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (res.status === 403 || res.status === 401) {
      // Legacy endpoint rejected the key — admin keys use the org Usage API instead
      return fetchOpenAIAdminUsage(apiKey, date);
    }
    if (!res.ok) {
      return { supported: true, records: [], error: `OpenAI usage API error: ${res.status}` };
    }

    const json = await res.json() as { data: OpenAIUsageItem[] };
    const records: ProviderUsageRecord[] = (json.data ?? []).map((item) => ({
      model: item.snapshot_id,
      tokensInput: item.n_context_tokens_total ?? 0,
      tokensOutput: item.n_generated_tokens_total ?? 0,
      costUsd: estimateCost(
        item.snapshot_id,
        item.n_context_tokens_total ?? 0,
        item.n_generated_tokens_total ?? 0,
      ),
    }));

    return { supported: true, records };
  } catch (err) {
    return { supported: true, records: [], error: String(err) };
  }
}

// Modern org Usage API — requires an Admin API key (sk-admin-…) created in the
// OpenAI console. Standard project keys get 401 here; legacy /v1/usage is tried first.

interface OpenAIAdminUsageResult {
  model?: string | null;
  input_tokens?: number;
  output_tokens?: number;
}

interface OpenAIAdminUsageBucket {
  results?: OpenAIAdminUsageResult[];
}

export async function fetchOpenAIAdminUsage(apiKey: string, date: string): Promise<FetchUsageResult> {
  try {
    const startTime = Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
    const endTime = startTime + 86_400;
    const params = new URLSearchParams({
      start_time: String(startTime),
      end_time: String(endTime),
      bucket_width: "1d",
      group_by: "model",
      limit: "1",
    });

    const res = await fetch(`https://api.openai.com/v1/organization/usage/completions?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (res.status === 401 || res.status === 403) {
      return {
        supported: true,
        records: [],
        error: "Unauthorized — standard keys need legacy usage access; org-wide data needs an Admin API key (sk-admin-…)",
      };
    }
    if (!res.ok) {
      return { supported: true, records: [], error: `OpenAI org usage API error: ${res.status}` };
    }

    const json = await res.json() as { data?: OpenAIAdminUsageBucket[] };
    const records: ProviderUsageRecord[] = (json.data ?? [])
      .flatMap((bucket) => bucket.results ?? [])
      .map((item) => ({
        model: item.model ?? "unknown",
        tokensInput: item.input_tokens ?? 0,
        tokensOutput: item.output_tokens ?? 0,
        costUsd: estimateCost(item.model ?? "unknown", item.input_tokens ?? 0, item.output_tokens ?? 0),
      }));

    return { supported: true, records };
  } catch (err) {
    return { supported: true, records: [], error: String(err) };
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────────
// Google does not expose a per-API-key usage endpoint.
// We ping the models list to verify the key is still valid and update
// last_polled_at. Usage data requires Cloud Billing API + service account.

export async function fetchGeminiUsage(apiKey: string): Promise<FetchUsageResult> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!res.ok) {
      return { supported: false, records: [], error: `Key ping failed: ${res.status}` };
    }
    // Key is alive — usage tracking via API key not supported by Google
    return {
      supported: false,
      records: [],
      error: "Gemini usage data requires Cloud Billing API + service account. Key is active.",
    };
  } catch (err) {
    return { supported: false, records: [], error: String(err) };
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
// Standard keys (sk-ant-api…) have no usage endpoint — ping only.
// Admin keys (sk-ant-admin…) can read the org Usage Report API.

interface AnthropicUsageResult {
  model?: string | null;
  uncached_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicUsageBucket {
  results?: AnthropicUsageResult[];
}

export async function fetchAnthropicUsage(apiKey: string, date: string): Promise<FetchUsageResult> {
  if (apiKey.startsWith("sk-ant-admin")) {
    return fetchAnthropicAdminUsage(apiKey, date);
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) {
      return { supported: false, records: [], error: `Key ping failed: ${res.status}` };
    }
    return {
      supported: false,
      records: [],
      error: "Anthropic usage data requires an Admin API key (sk-ant-admin…). Key is active.",
    };
  } catch (err) {
    return { supported: false, records: [], error: String(err) };
  }
}

export async function fetchAnthropicAdminUsage(apiKey: string, date: string): Promise<FetchUsageResult> {
  try {
    const params = new URLSearchParams({
      starting_at: `${date}T00:00:00Z`,
      ending_at: `${date}T23:59:59Z`,
      bucket_width: "1d",
      limit: "1",
    });
    params.append("group_by[]", "model");

    const res = await fetch(`https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`, {
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (res.status === 401 || res.status === 403) {
      return { supported: true, records: [], error: "Unauthorized — admin key lacks usage report permission" };
    }
    if (!res.ok) {
      return { supported: true, records: [], error: `Anthropic usage report API error: ${res.status}` };
    }

    const json = await res.json() as { data?: AnthropicUsageBucket[] };
    const records: ProviderUsageRecord[] = (json.data ?? [])
      .flatMap((bucket) => bucket.results ?? [])
      .map((item) => {
        // Cache-read tokens count toward input at a reduced rate; fold them in
        // for token totals — estimateCost treats them as standard input (slight overestimate)
        const tokensInput = (item.uncached_input_tokens ?? 0) + (item.cache_read_input_tokens ?? 0);
        const tokensOutput = item.output_tokens ?? 0;
        const model = item.model ?? "unknown";
        return {
          model,
          tokensInput,
          tokensOutput,
          costUsd: estimateCost(model, tokensInput, tokensOutput),
        };
      });

    return { supported: true, records };
  } catch (err) {
    return { supported: true, records: [], error: String(err) };
  }
}

// ── Groq ──────────────────────────────────────────────────────────────────────

export async function fetchGroqUsage(apiKey: string): Promise<FetchUsageResult> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return { supported: false, records: [], error: `Key ping failed: ${res.status}` };
    return { supported: false, records: [], error: "Groq usage API not publicly available. Key is active." };
  } catch (err) {
    return { supported: false, records: [], error: String(err) };
  }
}

// ── Replicate ─────────────────────────────────────────────────────────────────

export async function fetchReplicateUsage(apiKey: string): Promise<FetchUsageResult> {
  try {
    const res = await fetch("https://api.replicate.com/v1/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return { supported: false, records: [], error: `Key ping failed: ${res.status}` };
    return { supported: false, records: [], error: "Replicate usage requires predictions API parsing. Key is active." };
  } catch (err) {
    return { supported: false, records: [], error: String(err) };
  }
}

// ── Generic health-check for remaining providers ──────────────────────────────

export async function healthCheckOnly(): Promise<FetchUsageResult> {
  return {
    supported: false,
    records: [],
    error: "Usage tracking not yet implemented for this provider.",
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function fetchUsageForProvider(
  provider: string,
  apiKey: string,
  date: string,
): Promise<FetchUsageResult> {
  switch (provider) {
    case "openai":    return fetchOpenAIUsage(apiKey, date);
    case "gemini":    return fetchGeminiUsage(apiKey);
    case "anthropic": return fetchAnthropicUsage(apiKey, date);
    case "groq":      return fetchGroqUsage(apiKey);
    case "replicate": return fetchReplicateUsage(apiKey);
    default:          return healthCheckOnly();
  }
}
