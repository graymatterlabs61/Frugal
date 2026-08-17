import { Link, Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { color, space } from '../lib/tokens.js';

export interface PasswordResetEmailProps {
  url: string;
  /** Minutes until the link expires. better-auth defaults to 1 hour. */
  expiresInMinutes?: number;
}

export function PasswordResetEmail({ url, expiresInMinutes = 60 }: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your Frugal password — link expires in 1 hour.">
      <Hero eyebrow="Password reset" heading="Set a new password">
        Click below to choose a new password for your Frugal account. This link
        expires in {expiresInMinutes} minutes and can only be used once.
      </Hero>

      <Button href={url}>Reset password</Button>

      {/* Plain URL fallback — some corporate clients strip or rewrite button hrefs */}
      <Text className="e-muted" style={styles.fallback}>
        Button not working? Paste this into your browser:
        <br />
        <Link href={url} style={styles.link}>
          {url}
        </Link>
      </Text>

      <Text className="e-muted" style={styles.notice}>
        If you didn&apos;t request a reset, ignore this email — your password
        stays as it is. Someone may have entered your address by mistake.
      </Text>
    </BaseLayout>
  );
}

export default PasswordResetEmail;

export const passwordResetSubject = 'Reset your Frugal password';

export function passwordResetText({ url, expiresInMinutes = 60 }: PasswordResetEmailProps): string {
  return [
    'Set a new Frugal password',
    '',
    `Open this link to choose a new password: ${url}`,
    '',
    `The link expires in ${expiresInMinutes} minutes and can only be used once.`,
    '',
    "If you didn't request a reset, ignore this email — your password stays as it is.",
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
