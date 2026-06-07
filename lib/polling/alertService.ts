import type { SupabaseClient } from "@supabase/supabase-js";

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

  await sendEmail(payload, notifiedVia);
  if (payload.slackWebhookUrl) {
    await sendSlack(payload, notifiedVia);
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
  });
}

async function sendEmail(payload: AlertPayload, notifiedVia: string[]): Promise<void> {
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
    const { error } = await resend.emails.send({
      from: "Frugal <alerts@frugal.dev>",
      to: payload.userEmail,
      subject,
      html,
    });
    if (error) {
      console.error("[alertService] Resend error:", error);
    } else {
      notifiedVia.push("email");
    }
  } catch (err) {
    console.error("[alertService] Email send failed:", err);
  }
}

async function sendSlack(payload: AlertPayload, notifiedVia: string[]): Promise<void> {
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
    if (res.ok) notifiedVia.push("slack");
  } catch (err) {
    console.error("[alertService] Slack send failed:", err);
  }
}

function buildEmailHtml(payload: AlertPayload): string {
  const statusColor = payload.percentUsed >= 100 ? "#ef4444" : "#f97316";
  const statusText = payload.percentUsed >= 100 ? "Budget Exceeded" : "Budget Warning";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #222;border-radius:12px;padding:32px;">
    <div style="margin-bottom:24px;">
      <span style="background:${statusColor}22;color:${statusColor};font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;text-transform:uppercase;letter-spacing:.05em">${statusText}</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700">${payload.projectName}</h1>
    <p style="margin:0 0 24px;color:#888;font-size:14px">${payload.periodLabel} spend has reached ${payload.percentUsed.toFixed(0)}% of your budget limit.</p>
    <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#888;font-size:13px">Current spend</span>
        <span style="font-weight:700;color:#e5e5e5">$${payload.spendUsd.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <span style="color:#888;font-size:13px">Budget limit</span>
        <span style="font-weight:700;color:#e5e5e5">$${payload.limitUsd.toFixed(2)}</span>
      </div>
      <div style="background:#222;border-radius:4px;height:6px;overflow:hidden;">
        <div style="background:${statusColor};height:6px;width:${Math.min(100, payload.percentUsed).toFixed(0)}%;border-radius:4px;"></div>
      </div>
    </div>
    <p style="color:#555;font-size:12px;margin:0">You're receiving this because you set up a budget rule in <a href="https://frugal.dev" style="color:#f97316">Frugal</a>.</p>
  </div>
</body>
</html>`;
}
