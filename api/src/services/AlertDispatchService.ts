import { BillingRepository } from '../repositories/BillingRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { AlertRepository } from '../repositories/AlertRepository.js';
import { sendBudgetAlertEmail } from '../utils/email.js';
import { alertChannelsFor } from '../utils/alertChannelTier.js';
import { isSafeWebhookUrl } from '../utils/webhookUrl.js';
import type { alertLog } from '../db/schema.js';

type AlertLogRow = typeof alertLog.$inferSelect;

async function postWebhook(url: string, body: unknown): Promise<void> {
  if (!isSafeWebhookUrl(url)) {
    throw new Error('Webhook URL is not allowed (must be https, not a private/internal address)');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`webhook POST failed: ${res.status}`);
}

export const AlertDispatchService = {
  async dispatch(alert: AlertLogRow, userId: string, projectId: string): Promise<void> {
    const user = await BillingRepository.findById(userId);
    if (!user) return;
    const project = await ProjectRepository.findByIdForUser(projectId, userId);

    const channels = alertChannelsFor(user.plan ?? undefined);
    const notifiedVia: string[] = [];
    const deliveryStatus: Record<string, { ok: boolean; error?: string }> = {};

    if (channels.includes('email')) {
      try {
        await sendBudgetAlertEmail({
          to: user.email,
          projectName: project?.name ?? 'your project',
          spendAtTrigger: Number(alert.spendAtTrigger),
          limitUsd: Number(alert.limitUsd),
        });
        notifiedVia.push('email');
        deliveryStatus.email = { ok: true };
      } catch (err) {
        deliveryStatus.email = { ok: false, error: (err as Error).message };
      }
    }

    if (channels.includes('slack') && project?.slackWebhookUrl) {
      try {
        await postWebhook(project.slackWebhookUrl, {
          text: `Budget alert: ${project.name} has spent $${Number(alert.spendAtTrigger).toFixed(2)} of its $${Number(alert.limitUsd).toFixed(2)} limit.`,
        });
        notifiedVia.push('slack');
        deliveryStatus.slack = { ok: true };
      } catch (err) {
        deliveryStatus.slack = { ok: false, error: (err as Error).message };
      }
    }

    if (channels.includes('webhook') && project?.customWebhookUrl) {
      try {
        await postWebhook(project.customWebhookUrl, {
          event: 'budget_alert',
          projectId,
          spendAtTrigger: Number(alert.spendAtTrigger),
          limitUsd: Number(alert.limitUsd),
          triggeredAt: alert.triggeredAt,
        });
        notifiedVia.push('webhook');
        deliveryStatus.webhook = { ok: true };
      } catch (err) {
        deliveryStatus.webhook = { ok: false, error: (err as Error).message };
      }
    }

    await AlertRepository.recordDelivery(alert.id, notifiedVia, deliveryStatus);
  },
};
