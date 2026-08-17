import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { color, space, SITE_URL } from '../lib/tokens.js';

export interface ConnectionConnectedEmailProps {
  provider: string;
  projectName?: string | undefined;
  /** True when sent after a failure was resolved rather than on first connect. */
  recovered?: boolean | undefined;
}

export function ConnectionConnectedEmail({
  provider,
  projectName,
  recovered = false,
}: ConnectionConnectedEmailProps) {
  const where = projectName ? `${projectName} (${provider})` : provider;

  return (
    <BaseLayout
      preview={
        recovered
          ? `Polling recovered — ${provider} spend is being tracked again.`
          : `${provider} connected — Frugal is tracking spend now.`
      }
    >
      <Hero
        eyebrow={recovered ? 'Polling recovered' : 'Connection live'}
        heading={recovered ? `${provider} is being tracked again` : `${provider} is connected`}
        tone="success"
      >
        {recovered
          ? `Frugal can reach ${where} again and usage polling has resumed. Budget rules on this connection are active.`
          : `Frugal is now polling usage for ${where} every 5 minutes. Your API key is encrypted with AES-256 and is only ever used to read usage data.`}
      </Hero>

      <Button href={`${SITE_URL}/dashboard`}>View dashboard</Button>

      {!recovered ? (
        <Text className="e-muted" style={styles.notice}>
          First figures can take a few minutes to appear, and some providers
          report usage on a delay of their own. Set a budget rule next so
          there&apos;s a threshold to alert on.
        </Text>
      ) : null}
    </BaseLayout>
  );
}

export default ConnectionConnectedEmail;

export function connectionConnectedSubject({
  provider,
  recovered = false,
}: ConnectionConnectedEmailProps): string {
  return recovered
    ? `Recovered: ${provider} spend tracking resumed`
    : `${provider} connected to Frugal`;
}

export function connectionConnectedText({
  provider,
  projectName,
  recovered = false,
}: ConnectionConnectedEmailProps): string {
  const where = projectName ? `${projectName} (${provider})` : provider;
  return [
    recovered
      ? `Frugal can reach ${where} again — usage polling has resumed.`
      : `Frugal is now polling usage for ${where} every 5 minutes.`,
    '',
    `Dashboard: ${SITE_URL}/dashboard`,
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
