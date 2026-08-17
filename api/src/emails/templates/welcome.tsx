import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { FeatureRow } from '../components/blocks/feature-row.js';
import { color, space, SITE_URL } from '../lib/tokens.js';

export interface WelcomeEmailProps {
  name?: string | undefined;
}

/**
 * Sent once, after email verification succeeds.
 * Transactional, not promotional — no offers, no upsell (see the catalog rule:
 * a welcome email that sells is a marketing email and needs consent handling).
 */
export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome to Frugal.';

  return (
    <BaseLayout preview="Your Frugal account is ready — connect your first provider.">
      <Hero eyebrow="Account ready" heading={greeting}>
        Your email is verified and your account is live. Frugal watches your AI
        provider spend and tells you before a bill gets out of hand.
      </Hero>

      <Button href={`${SITE_URL}/dashboard`}>Go to dashboard</Button>

      <Text className="e-text" style={styles.sectionTitle}>
        Getting set up
      </Text>

      <FeatureRow
        glyph="1."
        title="Connect a provider"
        description="Add a read-only API key for OpenAI, Anthropic, Replicate, or fal.ai. Keys are encrypted with AES-256 before storage."
      />
      <FeatureRow
        glyph="2."
        title="Set a budget rule"
        description="Pick a monthly limit. Frugal checks your spend against it every 5 minutes."
      />
      <FeatureRow
        glyph="3."
        title="Get alerted"
        description="We email you when spend crosses your threshold — before the invoice, not after."
      />

      <Text className="e-muted" style={styles.footnote}>
        Frugal never sits between your app and the provider, so connecting adds
        no latency to your API calls.
      </Text>
    </BaseLayout>
  );
}

export default WelcomeEmail;

export const welcomeSubject = 'Your Frugal account is ready';

export function welcomeText({ name }: WelcomeEmailProps): string {
  return [
    name ? `Welcome, ${name}.` : 'Welcome to Frugal.',
    '',
    'Your email is verified and your account is live.',
    '',
    'Getting set up:',
    '1. Connect a provider — add a read-only API key (OpenAI, Anthropic, Replicate, fal.ai). Keys are AES-256 encrypted.',
    '2. Set a budget rule — pick a monthly limit; we check every 5 minutes.',
    '3. Get alerted — we email you before the invoice, not after.',
    '',
    `Dashboard: ${SITE_URL}/dashboard`,
  ].join('\n');
}

const styles = {
  sectionTitle: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 700,
    margin: `${space.lg} 0 ${space.md}`,
  },
  footnote: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.lg} 0 0`,
  },
} as const;
