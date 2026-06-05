import { createServiceClient } from "@/lib/supabase/service";
import { decrypt } from "@/lib/encryption";
import { fetchUsageForProvider } from "./usageFetchers";
import { checkBudgets } from "./budgetChecker";
import type { Connection, WorkerResult } from "./types";

export async function runPollingWorker(): Promise<WorkerResult> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const result: WorkerResult = { processed: 0, errors: 0, alertsFired: 0 };

  // Fetch all active connections (service role bypasses RLS)
  const { data: connections, error } = await supabase
    .from("api_connections")
    .select("id, user_id, provider, api_key_encrypted, project_id, status")
    // Filter to active connections by status column (is_active is synced by trigger but status is canonical)
    .eq("status", "active");

  if (error) {
    console.error("[worker] Failed to fetch connections:", error.message);
    return result;
  }

  for (const conn of (connections ?? []) as Connection[]) {
    try {
      const apiKey = decrypt(conn.api_key_encrypted);
      const usage = await fetchUsageForProvider(conn.provider, apiKey, today);

      // Write usage records to DB (only when provider supports it and returned data)
      if (usage.supported && usage.records.length > 0) {
        for (const rec of usage.records) {
          const { error: upsertError } = await supabase
            .from("usage_records")
            .upsert(
              {
                connection_id: conn.id,
                user_id: conn.user_id,
                date: today,
                model: rec.model,
                tokens_input: rec.tokensInput,
                tokens_output: rec.tokensOutput,
                cost_usd: rec.costUsd,
                raw_response: null,
              },
              { onConflict: "connection_id,date,model" },
            );

          if (upsertError) {
            console.error(`[worker] upsert failed for ${conn.id}/${rec.model}:`, upsertError.message);
          }
        }
      }

      // Update last_polled_at and status
      const newStatus = usage.error && usage.error.includes("Key ping failed")
        ? "polling_error"
        : "active";

      await supabase
        .from("api_connections")
        .update({ last_polled_at: new Date().toISOString(), status: newStatus })
        .eq("id", conn.id);

      if (usage.error) {
        console.info(`[worker] ${conn.provider} (${conn.id}): ${usage.error}`);
      }

      result.processed++;
    } catch (err) {
      console.error(`[worker] Error processing connection ${conn.id}:`, err);
      await supabase
        .from("api_connections")
        .update({ status: "polling_error" })
        .eq("id", conn.id);
      result.errors++;
    }
  }

  // Run budget checks after usage is written
  result.alertsFired = await checkBudgets(supabase);

  console.info(`[worker] Done — processed=${result.processed} errors=${result.errors} alerts=${result.alertsFired}`);
  return result;
}
