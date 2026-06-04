## Problem Statement

The alert service (`lib/polling/alertService.ts`) exists but email delivery is a stub (RESEND_API_KEY missing) and Slack webhook support is partially implemented. Users who set budget rules never receive the alerts they configured, breaking the core value proposition of Frugal.

## Solution

Complete alertService.ts with real Resend email delivery, add Slack webhook support with per-project configuration, verify deduplication logic, and persist delivery status to alert_log.

## User Stories

1. As a user with a budget rule, I want to receive an email when my project spend crosses the alert threshold so I can act before hitting the limit.
2. As a user, I want the alert email to include my current spend, limit, percentage used, and estimated days until limit so I have all context in one place.
3. As a Plus/Pro user, I want to configure a Slack webhook URL on each project so my team gets notified in Slack.
4. As a user, I want the same rule to not fire more than once per hour so I'm not spammed.
5. As a user, I want to see which delivery channels succeeded or failed in my alert log so I can debug notification issues.
6. As a Pro user, I want webhook alerts sent to my custom endpoint so I can integrate with my own systems.

## Implementation Decisions

**Phase 1 — DB migration + projects schema**
- Migration `004_projects_notifications.sql`:
  - Add `slack_webhook_url text` to projects table
  - Update alert_log.delivery_status to jsonb if not already: `{ email: 'sent'|'failed'|'skipped', slack: 'sent'|'failed'|'not_configured' }`

**Phase 2 — alertService.ts real implementation**
- `lib/polling/alertService.ts` sendAlert(payload):
  - Payload type: `{ userEmail, projectName, provider, currentSpend, limitUsd, thresholdPct, window, burnRateDaily, daysUntilLimit, dashboardUrl, slackWebhookUrl? }`
  - Email: `resend.emails.send({ from: 'alerts@frugal.dev', to: userEmail, subject: '⚠️ {projectName} — {thresholdPct}% of ${limitUsd} budget reached', html: buildAlertEmailHtml(payload) })`
  - Slack: if slackWebhookUrl, POST JSON block message to webhook URL
  - Track delivery status: catch errors per channel, set status accordingly
  - Return `{ email: DeliveryStatus, slack: DeliveryStatus }`

**Phase 3 — Email HTML template**
- `lib/polling/emailTemplates.ts` buildAlertEmailHtml(payload):
  - Clean, mobile-friendly HTML — no external CSS dependencies
  - Sections: headline (project + threshold), stats table (spend/limit/%), burn rate + days until limit, CTA button linking to dashboard
  - Subject line formula: "⚠️ [prod-api] hit 80% of $200 monthly budget"
  - From address: alerts@frugal.dev (verify domain in Resend dashboard)

**Phase 4 — Project detail Notifications UI**
- Add "Notifications" tab or section to project detail page
- Input: Slack webhook URL (type=url, placeholder="https://hooks.slack.com/..."), Save button
- PATCH /api/projects/[id] accepts `{ slack_webhook_url }`, validates URL format, saves
- Shows current saved URL masked (first 30 chars + "...") if configured
- "Test webhook" button → POST /api/projects/[id]/test-webhook → sends test Slack message

**Phase 5 — Deduplication verification + alert_log delivery_status**
- Audit `lib/polling/budgetChecker.ts` deduplication query
- Verify: `WHERE rule_id = $ruleId AND triggered_at > NOW() - INTERVAL '1 hour'`
- After alertService.ts returns delivery statuses, write to alert_log.delivery_status
- Verify alert_log INSERT includes delivery_status jsonb column

## Testing Decisions

- Test alertService.ts: mock Resend SDK at boundary, verify correct send params
- Test Slack: mock fetch at boundary, verify correct POST body and URL
- Test deduplication: seeded alert_log row within 1 hour → checkBudgets skips re-alert
- Test delivery status persistence: alert fired → alert_log row has correct delivery_status
- Test email template: snapshot test for HTML output with known payload
- Test PATCH /api/projects/[id] with slack_webhook_url: invalid URL → 400

## Out of Scope

- HMAC-signed webhook alerts (F-17 spec notes signing in V1.1)
- Multiple Slack channels per project
- PagerDuty / other alert channels
- Email unsubscribe flow (not in V1 scope)

## Further Notes

- RESEND_API_KEY env var must be set in Vercel before alerts can fire
- Domain verification in Resend for alerts@frugal.dev required
- Slack webhook test should fire a distinct "test message" to avoid confusion with real alerts
- Pro webhook alerts (F-17) use same mechanism but POST to user-configured URL — similar to Slack but with HMAC signing (deferred to V1.1)

## Decisions Log

Q: Email template approach?
A: Plain HTML string. No React Email.
Why: Zero new dependencies; Resend accepts HTML directly.

Q: Slack webhook location?
A: Per project, stored in projects.slack_webhook_url (new column).
Why: FEATURES.md specifies project-level Slack configuration.

Q: Delivery failure behavior?
A: Log + continue. Record in alert_log.delivery_status.
Why: V1 simplicity; retry logic in V1.1 if needed.

Q: Deduplication window?
A: 1 hour per rule. Existing budgetChecker logic — verify, don't rewrite.
Why: Already implemented; risk of breaking by rewriting.
