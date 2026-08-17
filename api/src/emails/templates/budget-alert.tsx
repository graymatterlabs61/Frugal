import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { HeroBand } from '../components/blocks/hero-band.js';
import { StatBlock } from '../components/blocks/stat-block.js';
import { ProgressBar } from '../components/blocks/progress-bar.js';
import { color, space, SITE_URL } from '../lib/tokens.js';

export interface BudgetAlertEmailProps {
  projectName: string;
  spendAtTrigger: number;
  limitUsd: number;
  /** 'alert' warns; 'block' means the connection was already cut. */
  actionTaken?: 'alert' | 'block' | 'throttle' | undefined;
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

/**
 * The product's core email. Two variants share this template because the data
 * is identical and only urgency differs — a 'block' has already happened, an
 * 'alert' is a heads-up.
 */
export function BudgetAlertEmail({
  projectName,
  spendAtTrigger,
  limitUsd,
  actionTaken = 'alert',
}: BudgetAlertEmailProps) {
  const pct = limitUsd > 0 ? Math.round((spendAtTrigger / limitUsd) * 100) : 0;
  const blocked = actionTaken === 'block';
  const throttled = actionTaken === 'throttle';
  const over = spendAtTrigger >= limitUsd;

  // Split so the trailing fragment renders serif-italic, matching the
  // landing page's headline treatment.
  const heading = blocked
    ? `${projectName} was`
    : throttled
      ? `${projectName} is being`
      : over
        ? `${projectName} is`
        : `${projectName} is at`;
  const accent = blocked
    ? 'blocked'
    : throttled
      ? 'throttled'
      : over
        ? 'over budget'
        : `${pct}% of budget`;

  const tone = blocked || over ? ('danger' as const) : ('warning' as const);
  const remaining = limitUsd - spendAtTrigger;

  return (
    <BaseLayout
      preview={`${projectName}: ${usd(spendAtTrigger)} of ${usd(limitUsd)} (${pct}%)`}
      hero={
        <HeroBand
          eyebrow={blocked ? 'Connection blocked' : over ? 'Over budget' : 'Budget threshold'}
          figure={usd(spendAtTrigger)}
          caption={`of ${usd(limitUsd)} limit · ${pct}% used`}
          tone={tone}
        >
          <ProgressBar percent={pct} tone={tone} />
        </HeroBand>
      }
    >
      <Hero heading={heading} accent={accent}>
        {blocked
          ? 'Your budget rule fired at the last poll and this connection has been blocked. No further spend will be tracked against it until you re-enable it.'
          : throttled
            ? 'Your budget rule fired at the last poll and this connection is being throttled.'
            : 'Your spend crossed the threshold on this budget rule. Nothing has been blocked — this is a heads-up.'}
      </Hero>

      <StatBlock
        stats={[
          { label: 'Spend', value: usd(spendAtTrigger), tone: over ? 'danger' : 'default' },
          { label: 'Limit', value: usd(limitUsd) },
          {
            label: over ? 'Over by' : 'Remaining',
            value: usd(Math.abs(remaining)),
            tone: over ? 'danger' : 'success',
          },
        ]}
      />

      <Button href={`${SITE_URL}/dashboard`}>View dashboard</Button>

      <Text style={styles.notice}>
        Frugal polls provider usage every 5 minutes, so figures can lag actual
        spend by up to that long. For a hard stop, pair this rule with your
        provider&apos;s own spending limit.
      </Text>
    </BaseLayout>
  );
}

export default BudgetAlertEmail;

export function budgetAlertSubject({
  projectName,
  spendAtTrigger,
  limitUsd,
  actionTaken = 'alert',
}: BudgetAlertEmailProps): string {
  const pct = limitUsd > 0 ? Math.round((spendAtTrigger / limitUsd) * 100) : 0;
  if (actionTaken === 'block') return `Blocked: ${projectName} hit its budget limit`;
  if (spendAtTrigger >= limitUsd) return `Over budget: ${projectName} at ${usd(spendAtTrigger)}`;
  return `Budget alert: ${projectName} at ${pct}% of limit`;
}

export function budgetAlertText({
  projectName,
  spendAtTrigger,
  limitUsd,
  actionTaken = 'alert',
}: BudgetAlertEmailProps): string {
  const pct = limitUsd > 0 ? Math.round((spendAtTrigger / limitUsd) * 100) : 0;
  return [
    actionTaken === 'block'
      ? `${projectName} was blocked at its budget limit.`
      : `${projectName} is at ${pct}% of its budget.`,
    '',
    `Spend: ${usd(spendAtTrigger)}`,
    `Limit: ${usd(limitUsd)}`,
    `Used:  ${pct}%`,
    '',
    `Dashboard: ${SITE_URL}/dashboard`,
    '',
    'Frugal polls every 5 minutes, so figures can lag actual spend by up to that long.',
  ].join('\n');
}

const styles = {
  notice: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.lg} 0 0`,
  },
} as const;
