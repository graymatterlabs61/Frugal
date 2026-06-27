import { Worker, type Job } from 'bullmq';
import * as Sentry from '@sentry/node';
import { config } from '@/config/unifiedConfig';
import { QUEUE_NAMES, alertDispatchQueue, type AlertDispatchJob } from './queue';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { UsageRepository } from '@/repositories/UsageRepository';
import { BudgetRepository, AlertRepository, NotificationRepository } from '@/repositories/BudgetRepository';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { decrypt } from '@/utils/encryption';
import { providers } from '@/providers';
import { logger } from '@/utils/logger';

const bullMqConnection = { url: config.redis.url };

const connectionRepository = new ConnectionRepository();
const usageRepository = new UsageRepository();
const budgetRepository = new BudgetRepository();
const alertRepository = new AlertRepository();
const notificationRepository = new NotificationRepository();
const projectRepository = new ProjectRepository();
const userRepository = new UserRepository();

const ALERT_DEDUP_WINDOW_MS = 60 * 60 * 1000;
// Cap simultaneous outbound provider API calls — prevents thundering herd at scale
const POLL_BATCH_SIZE = 10;

export function startPollingWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.POLLING,
    async (_job: Job) => {
      await runPollingCycle();
    },
    { connection: bullMqConnection, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    Sentry.captureException(err, { extra: { jobId: job?.id } });
    logger.error({ err, jobId: job?.id }, 'Polling worker job failed');
  });

  logger.info('Polling worker started');
  return worker;
}

async function runPollingCycle(): Promise<void> {
  const connections = await connectionRepository.findAllActive();
  logger.info(`Polling ${connections.length} active connections`);

  for (let i = 0; i < connections.length; i += POLL_BATCH_SIZE) {
    const batch = connections.slice(i, i + POLL_BATCH_SIZE);
    await Promise.allSettled(
      batch.map((conn) => pollConnection(conn.id, conn.userId, conn.provider, conn.apiKeyEncrypted, conn.projectId)),
    );
  }
}

async function pollConnection(
  connectionId: string,
  userId: string,
  providerName: string,
  apiKeyEncrypted: string,
  projectId: string,
): Promise<void> {
  const provider = providers[providerName];
  if (!provider) return;

  let apiKey: string;
  try {
    apiKey = decrypt(apiKeyEncrypted);
  } catch {
    await connectionRepository.updateLastPolled(connectionId, 'invalid');
    return;
  }

  const since = new Date();
  since.setDate(since.getDate() - 2);

  try {
    const usageData = await provider.fetchUsage(apiKey, since);

    for (const usage of usageData) {
      await usageRepository.upsert({
        connectionId,
        userId,
        date: usage.date,
        model: usage.model,
        tokensInput: usage.tokensInput,
        tokensOutput: usage.tokensOutput,
        costUsd: usage.costUsd.toFixed(6),
      });
    }

    await connectionRepository.updateLastPolled(connectionId, 'active');
    await checkBudgets(userId, projectId);
  } catch (err) {
    Sentry.captureException(err, { extra: { connectionId, providerName } });
    await connectionRepository.updateLastPolled(connectionId, 'polling_error');
  }
}

async function checkBudgets(userId: string, projectId: string): Promise<void> {
  const rules = await budgetRepository.findByProject(projectId);
  if (rules.length === 0) return;

  for (const rule of rules) {
    const since = rule.budgetWindow === 'daily'
      ? new Date(new Date().setHours(0, 0, 0, 0))
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const spend = await usageRepository.getTotalSpendByProject(userId, projectId, since);
    const limit = parseFloat(rule.limitUsd);
    const threshold = (rule.thresholdPct / 100) * limit;

    if (spend < threshold) continue;

    const hasRecent = await alertRepository.hasRecentAlert(projectId, rule.id, ALERT_DEDUP_WINDOW_MS);
    if (hasRecent) continue;

    const alert = await alertRepository.create({
      projectId,
      userId,
      ruleId: rule.id,
      spendAtTrigger: spend.toFixed(2),
      limitUsd: rule.limitUsd,
      actionTaken: rule.action,
      notifiedVia: [],
    });

    await notificationRepository.create({
      userId,
      type: 'budget_alert',
      title: 'Budget threshold reached',
      message: `Spend $${spend.toFixed(2)} hit ${rule.thresholdPct}% of $${limit.toFixed(2)} ${rule.budgetWindow} budget`,
    });

    const [project, user] = await Promise.all([
      projectRepository.findById(projectId),
      userRepository.findById(userId),
    ]);

    if (!project || !user) continue;

    const job: AlertDispatchJob = {
      alertId: alert.id,
      projectId,
      userId,
      spendAtTrigger: spend,
      limitUsd: limit,
      percentUsed: (spend / limit) * 100,
      budgetWindow: rule.budgetWindow,
      action: rule.action,
      slackWebhookUrl: project.slackWebhookUrl,
      customWebhookUrl: project.customWebhookUrl,
      userEmail: user.email,
      projectName: project.name,
    };

    await alertDispatchQueue.add('dispatch', job);
  }
}