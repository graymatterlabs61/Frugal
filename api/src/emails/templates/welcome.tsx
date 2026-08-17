import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { FeatureRow } from '../components/blocks/feature-row.js';
import { Signoff } from '../components/blocks/signoff.js';
import { Panel } from '../components/blocks/panel.js';
import { HeroImage } from '../components/blocks/hero-image.js';
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
  const greeting = name ? 'Welcome,' : 'Welcome to';
  const greetingAccent = name ? `${name}.` : 'Frugal.';

  return (
    <BaseLayout
      preview="Your Frugal account is ready — connect your first provider."
      hero={
        <HeroImage
          name="welcome-hero"
          alt="Preview of the Frugal dashboard: monthly spend total beside a daily spend bar chart"
          srcWidth={1196}
          srcHeight={513}
        />
      }
    >
      <Panel>
        <Hero eyebrow="Account ready" heading={greeting} accent={greetingAccent}>
          You&apos;re receiving this because you just verified your email, so
          your Frugal account is live. Frugal watches what your AI providers are
          charging you and says something before a bill gets out of hand — not
          after it lands.
        </Hero>
      </Panel>

      {/* CTA sits at card level, not inside the panel — it's the action for
          the whole email, and nesting it made it 50px narrower than the same
          button in templates that have no panel. */}
      <Button href={`${SITE_URL}/dashboard`}>Go to dashboard</Button>

      <Text style={styles.sectionTitle}>
        Three steps to get set up
      </Text>

      <FeatureRow
        glyph="1"
        title="Connect a provider"
        description="Add a read-only API key for OpenAI, Anthropic, Replicate, or fal.ai. Keys are encrypted with AES-256 before storage."
      />
      <FeatureRow
        glyph="2"
        title="Set a budget rule"
        description="Pick a monthly limit. Frugal checks your spend against it every 5 minutes."
      />
      <FeatureRow
        glyph="3"
        title="Get alerted"
        description="We email you when spend crosses your threshold — before the invoice, not after."
      />

      <Text style={styles.footnote}>
        Frugal never sits between your app and the provider, so connecting adds
        no latency to your API calls.
      </Text>

      <Signoff />
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
