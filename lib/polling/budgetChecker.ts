import type { SupabaseClient } from "@supabase/supabase-js";
import { fireAlert } from "./alertService";
import type { BudgetRule } from "./types";

interface ProjectSpend {
  project_id: string;
  spend_usd: number;
}

export async function checkBudgets(supabase: SupabaseClient): Promise<number> {
  let alertsFired = 0;

  // Get all active budget rules with project + user info
  const { data: rules, error } = await supabase
    .from("budget_rules")
    .select("*, projects(id, name, user_id, users(id, email))")
    .eq("is_active", true);

  if (error || !rules?.length) return 0;

  for (const rule of rules as (BudgetRule & {
    projects: { id: string; name: string; user_id: string; users: { id: string; email: string } };
  })[]) {
    const project = rule.projects;
    if (!project) continue;

    const spend = await getProjectSpend(supabase, project.id, rule.period);
    const percentUsed = rule.limit_usd > 0 ? (spend / rule.limit_usd) * 100 : 0;

    if (percentUsed < rule.alert_at_percent) continue;

    // Deduplicate: skip if an active alert for this rule already exists
    const { data: existing } = await supabase
      .from("alert_log")
      .select("id")
      .eq("rule_id", rule.id)
      .eq("status", "active")
      .gte("triggered_at", getPeriodStart(rule.period))
      .limit(1);

    if (existing?.length) continue;

    await fireAlert(supabase, {
      userId: project.user_id,
      projectId: project.id,
      ruleId: rule.id,
      projectName: project.name,
      userEmail: project.users.email,
      periodLabel: rule.period === "daily" ? "Daily" : "Monthly",
      spendUsd: spend,
      limitUsd: rule.limit_usd,
      percentUsed,
      action: rule.action,
      slackWebhookUrl: null, // future: pull from user settings
    });

    alertsFired++;
  }

  return alertsFired;
}

async function getProjectSpend(
  supabase: SupabaseClient,
  projectId: string,
  period: "daily" | "monthly",
): Promise<number> {
  const start = getPeriodStart(period);

  const { data } = await supabase
    .from("usage_records")
    .select("cost_usd, api_connections!inner(project_id)")
    .eq("api_connections.project_id", projectId)
    .gte("date", start);

  if (!data?.length) return 0;
  return data.reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);
}

function getPeriodStart(period: "daily" | "monthly"): string {
  const now = new Date();
  if (period === "daily") {
    return now.toISOString().split("T")[0];
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
