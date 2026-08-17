import { Link, Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { Panel } from '../components/blocks/panel.js';
import { Signoff } from '../components/blocks/signoff.js';
import { color, space } from '../lib/tokens.js';

export interface PasswordResetEmailProps {
  url: string;
  /** Minutes until the link expires. better-auth defaults to 1 hour. */
  expiresInMinutes?: number;
}

export function PasswordResetEmail({ url, expiresInMinutes = 60 }: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your Frugal password — link expires in 1 hour.">
      <Panel>
        <Hero eyebrow="Password reset" heading="Set a new" accent="password">
          Someone asked to reset the password on your Frugal account. Choose a
          new one below — the link expires in {expiresInMinutes} minutes and
          works only once.
        </Hero>
      </Panel>

      <Button href={url}>Reset password</Button>

      {/* Plain URL fallback — some corporate clients strip or rewrite button hrefs */}
      <Text style={styles.fallback}>
        Button not working? Paste this into your browser:
        <br />
        <Link href={url} style={styles.link}>
          {url}
        </Link>
      </Text>

      <Text style={styles.notice}>
        If that wasn&apos;t you, ignore this email — your password stays as it
        is, and nothing changes until the link is used.
      </Text>

      <Signoff />
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
