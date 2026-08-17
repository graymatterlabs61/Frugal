import { DashboardRepository } from '../repositories/DashboardRepository.js';

function monthRange(now: Date): { from: string; to: string } {
  const to = now.toISOString().slice(0, 10);
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  return { from, to };
}

function lastNDaysRange(days: number, now: Date): { from: string; to: string } {
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - (days - 1));
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export const DashboardService = {
  async summary(userId: string) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const { from: monthFrom, to: monthTo } = monthRange(now);

    const [dailySpend, monthlySpend, activeAlerts] = await Promise.all([
      DashboardRepository.totalSpend(userId, today, today),
      DashboardRepository.totalSpend(userId, monthFrom, monthTo),
      DashboardRepository.activeAlertsCount(userId),
    ]);

    return { dailySpend, monthlySpend, activeAlerts };
  },

  async spendChart(userId: string, days: number) {
    const { from, to } = lastNDaysRange(days, new Date());
    return DashboardRepository.spendSeries(userId, from, to);
  },

  async topProjects(userId: string, limit: number) {
    const { from, to } = monthRange(new Date());
    return DashboardRepository.topProjects(userId, from, to, limit);
  },
};
