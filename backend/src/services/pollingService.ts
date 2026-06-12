import type { BudgetRepository } from "../repositories/BudgetRepository.js";
import type { ConnectionRepository } from "../repositories/ConnectionRepository.js";
import type { UsageRepository } from "../repositories/UsageRepository.js";
import { sendBudgetAlert } from "../email/index.js";
import { decrypt } from "../utils/encryption.js";
import { logger } from "../utils/logger.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonthBounds(date: Date): { fromDate: string; toDate: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0); // last day
  return {
    fromDate: formatDate(from),
    toDate: formatDate(to),
  };
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── OpenAI usage fetch ────────────────────────────────────────────────────────

interface OpenAIUsageDay {
  aggregation_timestamp: number;
  n_requests: number;
  operation: string;
  snapshot_id: string;
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
  email: string;
}

interface OpenAIUsageResponse {
  data: OpenAIUsageDay[];
}

async function fetchOpenAIUsage(
  apiKey: string,
  date: string
): Promise<{ tokensInput: number; tokensOutput: number; costUsd: number }> {
  const url = `https://api.openai.com/v1/usage?date=${date}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`OpenAI usage API returned ${res.status}`);
  }

  const body = (await res.json()) as OpenAIUsageResponse;
  let tokensInput = 0;
  let tokensOutput = 0;

  for (const day of body.data) {
    tokensInput += day.n_context_tokens_total;
    tokensOutput += day.n_generated_tokens_total;
  }

  // Very rough cost estimate (GPT-4o blended, actual pricing per model would require
  // model_pricing table — stub for now, real pricing added in later phase)
  const costUsd = (tokensInput * 0.000005 + tokensOutput * 0.000015);

  return { tokensInput, tokensOutput, costUsd };
}

// ── Alert email ───────────────────────────────────────────────────────────────
// Uses the typed sendBudgetAlert helper from src/email/index.ts.
// NOTE: toEmail is currently set to userId (a placeholder). Replace with a real
// user email lookup via UserRepository once that method is available.

async function fireAlertEmail(opts: {
  toEmail: string;
  projectName: string;
  spendUsd: number;
  limitUsd: number;
  percentUsed: number;
  periodLabel: string;
}): Promise<boolean> {
  const result = await sendBudgetAlert(opts.toEmail, {
    projectName: opts.projectName,
    periodLabel: opts.periodLabel,
    spendUsd: opts.spendUsd,
    limitUsd: opts.limitUsd,
    percentUsed: opts.percentUsed,
  });
  return !result.error;
}

// ── PollingService ────────────────────────────────────────────────────────────

export class PollingService {
  constructor(
    private readonly connectionRepo: ConnectionRepository,
    private readonly usageRepo: UsageRepository,
    private readonly budgetRepo: BudgetRepository
  ) {}

  /**
   * Main polling cycle — called by QStash every 5 minutes.
   * Idempotent: upserts usage records, deduplicates alerts.
   */
  async runPollingCycle(): Promise<void> {
    const today = formatDate(new Date());
    const connections = await this.connectionRepo.findAllActiveForPolling();

    logger.info("polling_cycle_start", { connectionCount: connections.length, date: today });

    for (const conn of connections) {
      try {
        const apiKey = decrypt(conn.apiKeyEncrypted);

        if (conn.provider === "openai") {
          const usage = await fetchOpenAIUsage(apiKey, today);
          await this.usageRepo.upsertDailyRecord({
            connectionId: conn.id,
            userId: conn.userId,
            date: today,
            model: "aggregated",
            tokensInput: usage.tokensInput,
            tokensOutput: usage.tokensOutput,
            costUsd: usage.costUsd.toFixed(6),
          });
        } else {
          // Stub for all non-OpenAI providers
          logger.info("polling_provider_stub", { provider: conn.provider, connectionId: conn.id });
        }

        await this.connectionRepo.updateLastPolled(conn.id);

        // Run budget check for this connection's project
        if (conn.projectId) {
          await this.checkBudgets(conn.userId, conn.projectId).catch((err) => {
            logger.warn("budget_check_failed", {
              projectId: conn.projectId,
              error: err instanceof Error ? err.message : String(err),
            });
          });
        }
      } catch (err) {
        logger.error("polling_connection_error", {
          connectionId: conn.id,
          provider: conn.provider,
          error: err instanceof Error ? err.message : String(err),
        });
        await this.connectionRepo.updateStatus(conn.id, "polling_error").catch(() => {
          // Non-fatal
        });
      }
    }

    logger.info("polling_cycle_complete", { connectionCount: connections.length });
  }

  /**
   * Evaluate active budget rules for a project.
   * Fires email alert + logs to alert_log when threshold crossed.
   * Deduplicates: will not re-fire within 1 hour for the same rule.
   */
  async checkBudgets(userId: string, projectId: string): Promise<void> {
    const rules = await this.budgetRepo.findActiveByProject(projectId);
    if (rules.length === 0) return;

    const now = new Date();

    for (const rule of rules) {
      try {
        let fromDate: string;
        let toDate: string;

        if (rule.budgetWindow === "daily") {
          const today = formatDate(now);
          fromDate = today;
          toDate = today;
        } else {
          const bounds = getMonthBounds(now);
          fromDate = bounds.fromDate;
          toDate = bounds.toDate;
        }

        const spendStr = await this.usageRepo.getMonthlySpendByProject(
          userId,
          projectId,
          fromDate,
          toDate
        );

        const spend = parseFloat(spendStr);
        const limit = parseFloat(rule.limitUsd);
        const threshold = (rule.thresholdPct / 100) * limit;

        if (spend < threshold) continue;

        // Dedup: skip if already alerted within 1 hour
        const alreadyAlerted = await this.budgetRepo.hasRecentAlert(rule.id, 1);
        if (alreadyAlerted) {
          logger.info("budget_alert_deduped", { ruleId: rule.id });
          continue;
        }

        const percentUsed = limit > 0 ? Math.round((spend / limit) * 100) : 0;

        logger.info("budget_alert_triggered", {
          ruleId: rule.id,
          projectId,
          spend,
          limit,
          percentUsed,
          action: rule.action,
        });

        const notifiedVia: string[] = [];

        // Fire email alert.
        // TODO: replace userId with real user email from UserRepository,
        // and projectId with the project's display name from ProjectRepository.
        const now2 = new Date();
        const periodLabel = rule.budgetWindow === "daily"
          ? `Today (${formatDate(now2)})`
          : `${now2.toLocaleString("en-US", { month: "long" })} ${now2.getFullYear()}`;

        const emailSent = await fireAlertEmail({
          toEmail: userId, // placeholder — replace with real user email lookup
          projectName: projectId, // placeholder — replace with real project name lookup
          spendUsd: spend,
          limitUsd: parseFloat(rule.limitUsd),
          percentUsed,
          periodLabel,
        });

        if (emailSent) notifiedVia.push("email");

        await this.budgetRepo.logAlert({
          projectId,
          userId,
          ruleId: rule.id,
          spendAtTrigger: spend.toFixed(2),
          limitUsd: rule.limitUsd,
          actionTaken: rule.action,
          notifiedVia,
        });
      } catch (err) {
        logger.error("budget_rule_check_error", {
          ruleId: rule.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
}
