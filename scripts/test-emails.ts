/**
 * Test script — sends all 13 email templates to a given address.
 * Usage: npx tsx --env-file .env.local scripts/test-emails.ts [email]
 * Default recipient: neilkumaroff@gmail.com
 */

import {
  sendWelcome,
  sendMagicLink,
  sendPasswordReset,
  sendBudgetAlert,
  sendConnectionFailed,
  sendWeeklyDigest,
  sendSubscriptionUpgraded,
  sendSubscriptionCancelled,
  sendAnnouncement,
  sendOffer,
  sendReengagement,
  sendTicketReceived,
  sendTicketResolved,
} from "../lib/email";

const TO = process.argv[2] ?? "neilkumaroff@gmail.com";
const DASHBOARD_URL = "https://getfrugal.dev/dashboard";

type Job = { name: string; fn: () => Promise<{ success: boolean; error?: string; messageId?: string }> };

const jobs: Job[] = [
  {
    name: "welcome",
    fn: () => sendWelcome(TO, { userName: "Nilesh Kumar", userEmail: TO }),
  },
  {
    name: "magic-link",
    fn: () =>
      sendMagicLink(TO, {
        confirmationUrl: DASHBOARD_URL,
        otp: "482 951",
        expiresInMinutes: 10,
      }),
  },
  {
    name: "password-reset",
    fn: () =>
      sendPasswordReset(TO, {
        confirmationUrl: DASHBOARD_URL,
        expiresInMinutes: 30,
      }),
  },
  {
    name: "budget-alert (warning 82%)",
    fn: () =>
      sendBudgetAlert(TO, {
        projectName: "GPT-4 Production",
        periodLabel: "June 2026",
        spendUsd: 82.4,
        limitUsd: 100,
        percentUsed: 82.4,
      }),
  },
  {
    name: "budget-alert (exceeded 108%)",
    fn: () =>
      sendBudgetAlert(TO, {
        projectName: "Claude API (Staging)",
        periodLabel: "June 2026",
        spendUsd: 108.6,
        limitUsd: 100,
        percentUsed: 108.6,
      }),
  },
  {
    name: "connection-failed (invalid_key)",
    fn: () =>
      sendConnectionFailed(TO, {
        projectName: "GPT-4 Production",
        provider: "OpenAI",
        reason: "invalid_key",
      }),
  },
  {
    name: "connection-failed (rate_limited)",
    fn: () =>
      sendConnectionFailed(TO, {
        projectName: "Claude API (Staging)",
        provider: "Anthropic",
        reason: "rate_limited",
      }),
  },
  {
    name: "weekly-digest",
    fn: () =>
      sendWeeklyDigest(TO, {
        userName: "Nilesh Kumar",
        weekLabel: "Jun 1 – Jun 7, 2026",
        totalSpendUsd: 134.82,
        priorWeekSpendUsd: 98.4,
        projects: [
          { name: "GPT-4 Production", spendUsd: 89.5, changePercent: 42, provider: "OpenAI" },
          { name: "Claude API", spendUsd: 31.2, changePercent: -8, provider: "Anthropic" },
          { name: "Replicate ML", spendUsd: 14.12, changePercent: 3, provider: "Replicate" },
        ],
        topProvider: "OpenAI",
        alertsFired: 2,
      }),
  },
  {
    name: "subscription-upgraded (pro)",
    fn: () =>
      sendSubscriptionUpgraded(TO, {
        userName: "Nilesh Kumar",
        plan: "pro",
        periodEnd: "2026-07-08",
      }),
  },
  {
    name: "subscription-cancelled",
    fn: () =>
      sendSubscriptionCancelled(TO, {
        userName: "Nilesh Kumar",
        periodEnd: "2026-07-08",
      }),
  },
  {
    name: "announcement",
    fn: () =>
      sendAnnouncement(TO, {
        userName: "Nilesh Kumar",
        headline: "Frugal now supports Anthropic Claude usage tracking",
        subheadline: "Real-time spend tracking for every Claude model",
        body: "You can now connect your Anthropic API key to Frugal and track usage across all Claude models — Opus, Sonnet, and Haiku — broken down by model and time period.",
        tag: "New Feature",
        features: [
          { icon: "📊", title: "Per-model breakdown", description: "See exactly which Claude model is driving your costs." },
          { icon: "🔔", title: "Budget alerts", description: "Set limits per model or project. Get notified before you exceed them." },
          { icon: "⚡", title: "5-minute polling", description: "Usage data refreshed every 5 minutes on the free plan." },
        ],
        ctaLabel: "Try it now",
        ctaUrl: DASHBOARD_URL,
      }),
  },
  {
    name: "offer (50% off launch)",
    fn: () =>
      sendOffer(TO, {
        userName: "Nilesh Kumar",
        offerHeadline: "50% off Frugal Pro — launch week only",
        offerDescription:
          "To celebrate launch, we're offering 50% off your first 3 months of Frugal Pro. Use the code at checkout.",
        discountCode: "LAUNCH50",
        discountDisplay: "50% off",
        originalPrice: "$29/mo",
        discountedPrice: "$14.50/mo",
        expiresLabel: "Offer ends June 15, 2026",
        ctaLabel: "Claim offer",
        ctaUrl: "https://getfrugal.dev/pricing",
        urgencyNote: "Only 48 hours left — offer expires June 15",
      }),
  },
  {
    name: "reengagement (14 days)",
    fn: () =>
      sendReengagement(TO, {
        userName: "Nilesh Kumar",
        daysSinceLastLogin: 14,
        recentFeature: {
          name: "Slack budget alerts",
          description: "Get budget alerts sent directly to your Slack workspace, not just email.",
          url: DASHBOARD_URL,
        },
      }),
  },
  {
    name: "ticket-received",
    fn: () =>
      sendTicketReceived(TO, {
        userName: "Nilesh Kumar",
        ticketId: "FRG-0042",
        subject: "OpenAI usage data missing for June 5–6",
        messagePreview:
          "Hi, I noticed that my usage records for June 5th and 6th are missing from the dashboard. My project GPT-4 Production shows $0 for those two days but I can see activity in OpenAI's own dashboard...",
        priority: "normal",
      }),
  },
  {
    name: "ticket-resolved",
    fn: () =>
      sendTicketResolved(TO, {
        userName: "Nilesh Kumar",
        ticketId: "FRG-0042",
        subject: "OpenAI usage data missing for June 5–6",
        resolution:
          "Thanks for reaching out. We identified a gap in the polling schedule due to a QStash retry timeout on June 5th between 02:00–04:00 UTC. The missing records have been backfilled manually and should now appear in your dashboard.\n\nApologies for the confusion — we've added a monitoring alert to catch this class of polling gap going forward.",
        agentName: "Nilesh from Frugal",
        feedbackUrl: "https://getfrugal.dev/support/feedback",
      }),
  },
];

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key || !key.startsWith("re_")) {
    console.error(
      `\n  ERROR: RESEND_API_KEY is not set or invalid.\n` +
      `  Expected format: re_xxxxxxxxxxxx\n` +
      `  Get your key at: https://resend.com/api-keys\n`
    );
    process.exit(1);
  }

  console.log(`\nSending ${jobs.length} emails to: ${TO}\n`);

  let passed = 0;
  let failed = 0;

  for (const job of jobs) {
    process.stdout.write(`  ${job.name.padEnd(40, ".")} `);
    try {
      const result = await job.fn();
      if (result.success) {
        console.log(`OK  ${result.messageId}`);
        passed++;
      } else {
        console.log(`FAIL  ${result.error}`);
        failed++;
      }
    } catch (err) {
      console.log(`THROW  ${String(err)}`);
      failed++;
    }
    // Small delay to avoid Resend rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n  ${passed} sent, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main();