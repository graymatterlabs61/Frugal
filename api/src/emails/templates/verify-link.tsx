import { Link, Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { color, space } from '../lib/tokens.js';

export interface VerifyLinkEmailProps {
  url: string;
  expiresInHours?: number;
}

/**
 * Link-based email verification — the flow currently live in production.
 *
 * Kept alongside verify-otp until the web verify-email page switches to a code
 * input; at that point this and its better-auth wiring can be deleted.
 */
export function VerifyLinkEmail({ url, expiresInHours = 24 }: VerifyLinkEmailProps) {
  return (
    <BaseLayout preview="Confirm your email address to activate your Frugal account.">
      <Hero eyebrow="Verify your email" heading="Confirm your" accent="email address">
        One click and your Frugal account is active. This link expires in{' '}
        {expiresInHours} hours.
      </Hero>

      <Button href={url}>Verify email address</Button>

      <Text style={styles.fallback}>
        Button not working? Paste this into your browser:
        <br />
        <Link href={url} style={styles.link}>
          {url}
        </Link>
      </Text>

      <Text style={styles.notice}>
        If you didn&apos;t create a Frugal account, ignore this email — no
        account is activated until this link is used.
      </Text>
    </BaseLayout>
  );
}

export default VerifyLinkEmail;

export const verifyLinkSubject = 'Verify your Frugal email';

export function verifyLinkText({ url, expiresInHours = 24 }: VerifyLinkEmailProps): string {
  return [
    'Confirm your email address',
    '',
    `Open this link to activate your Frugal account: ${url}`,
    '',
    `The link expires in ${expiresInHours} hours.`,
    '',
    "If you didn't create a Frugal account, ignore this email.",
  ].join('\n');
}

const styles = {
  fallback: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.md} 0 0`,
    wordBreak: 'break-all' as const,
  },
  link: {
    color: color.primary,
    textDecoration: 'underline',
  },
  notice: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.lg} 0 0`,
  },
} as const;
