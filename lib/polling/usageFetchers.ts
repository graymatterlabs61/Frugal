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
      return { supported: true, records: [], error: "Unauthorized — check key permissions" };
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
// No public usage API accessible via API key.

export async function fetchAnthropicUsage(apiKey: string): Promise<FetchUsageResult> {
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
      error: "Anthropic usage data not available via API key. Key is active.",
    };
  } catch (err) {
    return { supported: false, records: [], error: String(err) };
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
    case "anthropic": return fetchAnthropicUsage(apiKey);
    case "groq":      return fetchGroqUsage(apiKey);
    case "replicate": return fetchReplicateUsage(apiKey);
    default:          return healthCheckOnly();
  }
}
