import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBudgetAlert } from "@/lib/email";

interface AlertPayload {
  userId: string;
  projectId: string;
  ruleId: string;
  projectName: string;
  userEmail: string;
  periodLabel: string;
  spendUsd: number;
  limitUsd: number;
  percentUsed: number;
  action: string;
  slackWebhookUrl?: string | null;
}

export async function fireAlert(
  supabase: SupabaseClient,
  payload: AlertPayload,
): Promise<void> {
  const notifiedVia: string[] = [];

  const deliveryStatus: {
    email: { sent: boolean; messageId?: string; error?: string };
    slack: { sent: boolean; error?: string };
  } = {
    email: { sent: false },
    slack: { sent: false },
  };

  const emailResult = await sendBudgetAlert(payload.userEmail, {
    projectName: payload.projectName,
    periodLabel: payload.periodLabel,
    spendUsd: payload.spendUsd,
    limitUsd: payload.limitUsd,
    percentUsed: payload.percentUsed,
  });

  if (emailResult.success) {
    notifiedVia.push("email");
    deliveryStatus.email = { sent: true, messageId: emailResult.messageId };
  } else {
    console.error("[alertService] Email failed:", emailResult.error);
    deliveryStatus.email = { sent: false, error: emailResult.error };
  }

  if (payload.slackWebhookUrl) {
    await sendSlack(payload, notifiedVia, deliveryStatus);
  }

  await supabase.from("alert_log").insert({
    project_id: payload.projectId,
    user_id: payload.userId,
    rule_id: payload.ruleId,
    spend_at_trigger: payload.spendUsd,
    limit_usd: payload.limitUsd,
    action_taken: payload.action,
    notified_via: notifiedVia,
    status: "active",
    delivery_status: deliveryStatus,
  });
}

async function sendSlack(
  payload: AlertPayload,
  notifiedVia: string[],
  deliveryStatus: { slack: { sent: boolean; error?: string } },
): Promise<void> {
  if (!payload.slackWebhookUrl) return;

  const emoji = payload.percentUsed >= 100 ? "🚨" : "⚠️";
  const message = {
    text: `${emoji} *Frugal Budget Alert — ${payload.projectName}*`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} *Budget Alert: ${payload.projectName}*\n>${payload.periodLabel} spend *$${payload.spendUsd.toFixed(2)}* of *$${payload.limitUsd.toFixed(2)}* limit (${payload.percentUsed.toFixed(0)}%)`,
        },
      },
    ],
  };

  try {
    const res = await fetch(payload.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      notifiedVia.push("slack");
      deliveryStatus.slack = { sent: true };
    } else {
      deliveryStatus.slack = { sent: false, error: `HTTP ${res.status}` };
    }
  } catch (err) {
    console.error("[alertService] Slack send failed:", err);
    deliveryStatus.slack = { sent: false, error: String(err) };
  }
}
