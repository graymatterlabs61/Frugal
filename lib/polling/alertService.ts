import type { SupabaseClient } from "@supabase/supabase-js";
import { buildEmailHtml } from "./emailTemplates";

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

  await sendEmail(payload, notifiedVia, deliveryStatus);
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

async function sendEmail(
  payload: AlertPayload,
  notifiedVia: string[],
  deliveryStatus: { email: { sent: boolean; messageId?: string; error?: string } },
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[alertService] RESEND_API_KEY not set — skipping email");
    return;
  }

  const subject = payload.percentUsed >= 100
    ? `🚨 Budget limit hit: ${payload.projectName}`
    : `⚠️ Budget alert: ${payload.projectName} at ${payload.percentUsed.toFixed(0)}%`;

  const html = buildEmailHtml(payload);

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_ADDRESS ?? "Frugal <onboarding@resend.dev>",
      to: payload.userEmail,
      subject,
      html,
    });
    if (error) {
      console.error("[alertService] Resend error:", error);
      deliveryStatus.email = { sent: false, error: String(error) };
    } else {
      notifiedVia.push("email");
      deliveryStatus.email = { sent: true, messageId: data?.id };
    }
  } catch (err) {
    console.error("[alertService] Email send failed:", err);
    deliveryStatus.email = { sent: false, error: String(err) };
  }
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
