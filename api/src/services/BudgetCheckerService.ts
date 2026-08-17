import { BudgetRuleRepository } from '../repositories/BudgetRuleRepository.js';
import { AlertRepository } from '../repositories/AlertRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { SpendRepository } from '../repositories/SpendRepository.js';
import { AlertDispatchService } from './AlertDispatchService.js';
import { logger } from '../utils/logger.js';
import type { BudgetWindow } from '../db/schema.js';

// Per spec's testing strategy note ("budgetChecker: threshold logic, 1-hour dedup window") —
// don't re-alert the same rule more than once per hour even if every 5-min poll still crosses it.
const DEDUP_WINDOW_MS = 60 * 60 * 1000;

function windowRange(window: BudgetWindow, now: Date): { from: string; to: string } {
  const today = now.toISOString().slice(0, 10);
  if (window === 'daily') return { from: today, to: today };
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  return { from: firstOfMonth, to: today };
}

export const BudgetCheckerService = {
  /**
   * Called after any usage write (poll or ingest) lands for this project.
   *
   * KNOWN LIMITATION: `rule.action` ('alert' | 'block' | 'throttle') is recorded on the
   * alert (`actionTaken`) but every action currently produces the identical outcome —
   * an alert + notification + dispatch, nothing more. Real block/throttle enforcement
   * requires a request-path interceptor (the corporate `frugal-proxy`, spec §3), which
   * doesn't exist for personal-tier polling. There is no substitute enforcement gesture
   * here (e.g. auto-disabling the connection) — until one is added, `action` is
   * informational only for personal-tier rules, matching the spec's own anti-pattern
   * rule ("no overpromising enforcement — copy must reflect this honestly").
   */
  async checkProject(projectId: string): Promise<void> {
    const rules = await BudgetRuleRepository.listActiveForProject(projectId);
    if (rules.length === 0) return;

    const now = new Date();
    for (const rule of rules) {
      const { from, to } = windowRange(rule.budgetWindow, now);
      const spend = await SpendRepository.sumForProject(projectId, from, to);
      const limitUsd = Number(rule.limitUsd);
      const threshold = (limitUsd * rule.thresholdPct) / 100;
      if (spend < threshold) continue;

      const recent = await AlertRepository.findRecentForRule(
        rule.id,
        new Date(now.getTime() - DEDUP_WINDOW_MS),
      );
      if (recent) continue;

      const alert = await AlertRepository.create({
        projectId,
        userId: rule.userId,
        ruleId: rule.id,
        spendAtTrigger: spend,
        limitUsd,
        actionTaken: rule.action,
      });

      await NotificationRepository.create({
        userId: rule.userId,
        type: 'budget_alert',
        title: 'Budget alert triggered',
        message: `Spend has reached $${spend.toFixed(2)} of your $${limitUsd.toFixed(2)} ${rule.budgetWindow} limit.`,
      });

      try {
        await AlertDispatchService.dispatch(alert, rule.userId, projectId);
      } catch (err) {
        logger.warn({ alertId: alert.id, err }, 'alert dispatch failed');
      }
    }
  },
};
