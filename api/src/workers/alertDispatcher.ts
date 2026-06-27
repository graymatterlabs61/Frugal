import { Worker, type Job } from 'bullmq';
import { Resend } from 'resend';
import * as Sentry from '@sentry/node';
import { config } from '@/config/unifiedConfig';
import { QUEUE_NAMES, type AlertDispatchJob } from './queue';
import { AlertRepository } from '@/repositories/BudgetRepository';
import { assertSafeWebhookUrl } from '@/utils/ssrf';
import { logger } from '@/utils/logger';

const bullMqConnection = { url: config.redis.url };
const resend = new Resend(config.resend.apiKey);
const alertRepository = new AlertRepository();

export function startAlertDispatcher(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.ALERT_DISPATCH,
    async (job: Job<AlertDispatchJob>) => {
      await dispatch(job.data);
    },
    { connection: bullMqConnection, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    Sentry.captureException(err, { extra: { jobId: job?.id, data: job?.data } });
    logger.error({ err, jobId: job?.id }, 'Alert dispatch failed');
  });

  logger.info('Alert dispatcher started');
  return worker;
}

async function dispatch(job: AlertDispatchJob): Promise<void> {
  const notifiedVia: string[] = [];
  const deliveryStatus: Record<string, unknown> = {};

  // Email (all plans)
  try {
    const result = await resend.emails.send({
      from: config.resend.fromAddress,
      to: job.userEmail,
      subject: `⚠️ Budget alert: ${job.projectName}`,
      html: buildEmailHtml(job),
    });
    notifiedVia.push('email');
    deliveryStatus.email = { id: result.data?.id, status: 'sent' };
  } catch (err) {
    Sentry.captureException(err, { extra: { alertId: job.alertId } });
    deliveryStatus.email = { status: 'failed', error: String(err) };
  }

  // Slack webhook (Plus+)
  if (job.slackWebhookUrl) {
    try {
      assertSafeWebhookUrl(job.slackWebhookUrl);
      const res = await fetch(job.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ *Budget Alert* — ${job.projectName}\nSpend: $${job.spendAtTrigger.toFixed(2)} / $${job.limitUsd.toFixed(2)} (${job.percentUsed.toFixed(1)}%)`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      notifiedVia.push('slack');
      deliveryStatus.slack = { status: res.ok ? 'sent' : 'failed', httpStatus: res.status };
    } catch (err) {
      deliveryStatus.slack = { status: 'failed', error: String(err) };
    }
  }

  // Custom webhook (Pro+)
  if (job.customWebhookUrl) {
    try {
      assertSafeWebhookUrl(job.customWebhookUrl);
      const res = await fetch(job.customWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frugal-Event': 'budget_alert' },
        body: JSON.stringify({
          event: 'budget_alert',
          alertId: job.alertId,
          projectId: job.projectId,
          projectName: job.projectName,
          spendAtTrigger: job.spendAtTrigger,
          limitUsd: job.limitUsd,
          percentUsed: job.percentUsed,
          budgetWindow: job.budgetWindow,
          action: job.action,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      notifiedVia.push('webhook');
      deliveryStatus.webhook = { status: res.ok ? 'sent' : 'failed', httpStatus: res.status };
    } catch (err) {
      deliveryStatus.webhook = { status: 'failed', error: String(err) };
    }
  }

  await alertRepository.update(job.alertId, { notifiedVia, deliveryStatus });
  logger.info({ alertId: job.alertId, notifiedVia }, 'Alert dispatched');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(job: AlertDispatchJob): string {
  const name = escapeHtml(job.projectName);
  const action = escapeHtml(job.action);
  const window = escapeHtml(job.budgetWindow);
  return `
    <h2>Budget Alert — ${name}</h2>
    <p>Your project has reached ${job.percentUsed.toFixed(1)}% of its ${window} budget.</p>
    <ul>
      <li>Spend: <strong>$${job.spendAtTrigger.toFixed(2)}</strong></li>
      <li>Budget: <strong>$${job.limitUsd.toFixed(2)}</strong></li>
      <li>Action: <strong>${action}</strong></li>
    </ul>
    <p>Log in to Frugal to manage your budget rules.</p>
  `;
}