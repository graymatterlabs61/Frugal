import { Column, Row, Section, Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Divider } from '../components/layout/divider.js';
import { Hero } from '../components/blocks/hero.js';
import { HeroBand } from '../components/blocks/hero-band.js';
import { BarChart } from '../components/blocks/bar-chart.js';
import { StatBlock } from '../components/blocks/stat-block.js';
import { color, font, space, SITE_URL } from '../lib/tokens.js';

export interface DigestProviderRow {
  provider: string;
  costUsd: number;
}

export interface WeeklyDigestEmailProps {
  /** e.g. "Aug 11 – Aug 17" */
  periodLabel: string;
  totalUsd: number;
  /** Previous period total, for the delta. Omit when there's no prior week. */
  previousUsd?: number | undefined;
  providers: DigestProviderRow[];
  /** Budget alerts fired during the period. */
  alertCount?: number | undefined;
  unsubscribeUrl?: string | undefined;
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export function WeeklyDigestEmail({
  periodLabel,
  totalUsd,
  previousUsd,
  providers,
  alertCount = 0,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  const hasPrevious = typeof previousUsd === 'number' && previousUsd > 0;
  const deltaPct = hasPrevious ? Math.round(((totalUsd - previousUsd) / previousUsd) * 100) : null;
  const deltaLabel =
    deltaPct === null ? undefined : `${deltaPct >= 0 ? '↑' : '↓'} ${Math.abs(deltaPct)}% vs last week`;

  const top = [...providers].sort((a, b) => b.costUsd - a.costUsd);

  return (
    <BaseLayout
      preview={`${usd(totalUsd)} across ${providers.length} provider${providers.length === 1 ? '' : 's'} — ${periodLabel}`}
      {...(unsubscribeUrl ? { unsubscribeUrl } : {})}
      hero={
        <HeroBand
          eyebrow={`Weekly digest · ${periodLabel}`}
          figure={usd(totalUsd)}
          caption={
            deltaLabel ? `total spend · ${deltaLabel}` : 'total spend across all providers'
          }
          tone={deltaPct !== null && deltaPct > 0 ? 'warning' : 'default'}
        />
      }
    >
      <Hero heading="Your AI spend" accent="this week">
        Here&apos;s where your API spend landed over the past seven days.
      </Hero>

      <StatBlock
        stats={[
          { label: 'Providers', value: String(providers.length) },
          {
            label: 'Alerts',
            value: String(alertCount),
            ...(alertCount > 0 ? { tone: 'danger' as const } : {}),
          },
          {
            label: 'Top spend',
            value: top[0] ? usd(top[0].costUsd) : usd(0),
          },
        ]}
      />

      {top.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>By provider</Text>
          <BarChart
            rows={top.map((p) => ({
              label: p.provider,
              value: p.costUsd,
              display: usd(p.costUsd),
            }))}
          />
          <Divider spacing={space.md} />
        </>
      ) : (
        <Text style={styles.empty}>No usage recorded this week.</Text>
      )}

      <Button href={`${SITE_URL}/dashboard`}>Open dashboard</Button>
    </BaseLayout>
  );
}

export default WeeklyDigestEmail;

export function weeklyDigestSubject({ totalUsd, periodLabel }: WeeklyDigestEmailProps): string {
  return `${usd(totalUsd)} in AI spend — ${periodLabel}`;
}

export function weeklyDigestText({
  periodLabel,
  totalUsd,
  providers,
  alertCount = 0,
}: WeeklyDigestEmailProps): string {
  const lines = [
    `Your AI spend — ${periodLabel}`,
    '',
    `Total: ${usd(totalUsd)}`,
    `Providers: ${providers.length}`,
    `Alerts: ${alertCount}`,
  ];
  if (providers.length) {
    lines.push('', 'By provider:');
    for (const p of [...providers].sort((a, b) => b.costUsd - a.costUsd)) {
      lines.push(`  ${p.provider}: ${usd(p.costUsd)}`);
    }
  }
  lines.push('', `Dashboard: ${SITE_URL}/dashboard`);
  return lines.join('\n');
}

const styles = {
  sectionTitle: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 700,
    margin: `${space.lg} 0 ${space.sm}`,
  },
  rowLabel: {
    color: color.text,
    fontSize: '14px',
    lineHeight: '22px',
    margin: `${space.xs} 0`,
  },
  amountCol: {
    textAlign: 'right' as const,
  },
  rowAmount: {
    color: color.text,
    fontFamily: font.mono,
    fontSize: '14px',
    lineHeight: '22px',
    margin: `${space.xs} 0`,
  },
  empty: {
    color: color.textMuted,
    fontSize: '14px',
    margin: `0 0 ${space.lg}`,
  },
} as const;
