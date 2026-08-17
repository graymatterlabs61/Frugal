import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { FeatureRow } from '../components/blocks/feature-row.js';
import { color, space, SITE_URL } from '../lib/tokens.js';

export interface ConnectionFailedEmailProps {
  provider: string;
  projectName?: string | undefined;
  /** Provider-side reason, if the API gave one. */
  reason?: string | undefined;
  /** How long polling has been failing. */
  failingSince?: string | undefined;
}

/**
 * Polling for a connection stopped working.
 *
 * This is the highest-stakes email Frugal sends: a silently dead connection
 * means the user believes they're covered while spend runs unwatched — exactly
 * the surprise bill the product exists to prevent.
 */
export function ConnectionFailedEmail({
  provider,
  projectName,
  reason,
  failingSince,
}: ConnectionFailedEmailProps) {
  return (
    <BaseLayout preview={`Frugal can't reach your ${provider} connection — spend is not being tracked.`}>
      <Hero
        eyebrow="Action required"
        heading={`We can't reach your ${provider} connection`}
        tone="danger"
      >
        Frugal stopped being able to poll usage for{' '}
        {projectName ? `${projectName} (${provider})` : provider}
        {failingSince ? `, starting ${failingSince}` : ''}.{' '}
        <strong>Spend on this connection is not being tracked, and budget rules
        for it will not fire.</strong>
      </Hero>

      {reason ? (
        <Text style={styles.reason}>
          Provider response: {reason}
        </Text>
      ) : null}

      <Button href={`${SITE_URL}/connections`}>Fix connection</Button>

      <Text style={styles.sectionTitle}>
        Common causes
      </Text>
      <FeatureRow glyph="·" title="The API key was rotated or revoked" />
      <FeatureRow glyph="·" title="The key lost the permission needed to read usage" />
      <FeatureRow glyph="·" title="Billing lapsed on the provider account" />

      <Text style={styles.notice}>
        We&apos;ll keep retrying and email you once polling recovers. You
        won&apos;t get this alert again for the same connection while it stays
        broken.
      </Text>
    </BaseLayout>
  );
}

export default ConnectionFailedEmail;

export function connectionFailedSubject({ provider }: ConnectionFailedEmailProps): string {
  return `Action required: Frugal can't reach your ${provider} connection`;
}

export function connectionFailedText({
  provider,
  projectName,
  reason,
}: ConnectionFailedEmailProps): string {
  return [
    `Frugal can't reach your ${provider} connection${projectName ? ` on ${projectName}` : ''}.`,
    '',
    'Spend on this connection is NOT being tracked, and budget rules for it will not fire.',
    reason ? `\nProvider response: ${reason}` : '',
    '',
    'Common causes: the API key was rotated or revoked, it lost usage-read permission, or billing lapsed on the provider account.',
    '',
    `Fix it: ${SITE_URL}/connections`,
  ]
    .filter(Boolean)
    .join('\n');
}

const styles = {
  reason: {
    backgroundColor: color.surfaceRaised,
    border: `1px solid ${color.border}`,
    borderRadius: '8px',
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `0 0 ${space.lg}`,
    padding: space.md,
  },
  sectionTitle: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 700,
    margin: `${space.lg} 0 ${space.md}`,
  },
  notice: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.lg} 0 0`,
  },
} as const;
