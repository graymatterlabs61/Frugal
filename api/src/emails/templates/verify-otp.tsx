import { Link, Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Divider } from '../components/layout/divider.js';
import { Hero } from '../components/blocks/hero.js';
import { HeroBand } from '../components/blocks/hero-band.js';
import { color, space } from '../lib/tokens.js';

/** Matches better-auth's emailOTP `type` argument. */
export type OtpPurpose = 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';

export interface VerifyOtpEmailProps {
  code: string;
  purpose?: OtpPurpose;
  /** Minutes until the code expires. */
  expiresInMinutes?: number;
}

/**
 * One-time code email.
 *
 * Copy adapts to the purpose: the same six digits mean different things for a
 * sign-in than for a password reset, and a recipient who gets "verify your
 * email" while resetting a password has no way to tell a real message from a
 * spoofed one.
 *
 * No link and no CTA button by design — a code-only email can't be turned into
 * a phishing click, and there's nothing for a scanner to consume by prefetching.
 */
interface OtpCopy {
  eyebrow: string;
  subject: string;
  heading: string;
  accent: string;
  /** Where the code goes. First thing a reader needs. */
  body: string;
  /** What happens after the code is accepted — removes the "then what?" gap. */
  next: string;
}

const COPY: Record<OtpPurpose, OtpCopy> = {
  'email-verification': {
    eyebrow: 'One step left',
    subject: 'Verify your Frugal email',
    heading: "You're almost",
    accent: 'there',
    body: 'Enter the code above in the window where you started creating your account. It confirms the address is yours — nothing changes on your account until you do.',
    next: 'Once it goes through, your account is active and you can connect your first provider.',
  },
  'sign-in': {
    eyebrow: 'Sign in',
    subject: 'Your Frugal sign-in code',
    heading: 'Enter this code to',
    accent: 'sign in',
    body: 'Enter the code above in the sign-in window you already have open. It works once, and only for this attempt.',
    next: 'If you closed that window, start again from the sign-in page and request a new code.',
  },
  'forget-password': {
    eyebrow: 'Password reset',
    subject: 'Your Frugal password reset code',
    heading: 'Reset your',
    accent: 'password',
    body: 'Enter the code above in the reset window you already have open, then choose a new password.',
    next: 'Your current password keeps working until you finish, so nothing breaks if you stop here.',
  },
  'change-email': {
    eyebrow: 'Confirm new address',
    subject: 'Confirm your new Frugal email address',
    heading: 'Confirm your new',
    accent: 'address',
    body: 'Enter the code above in the window you already have open to confirm this address.',
    next: 'Your account keeps using the old address, and keeps receiving alerts there, until this is confirmed.',
  },
};

export function VerifyOtpEmail({
  code,
  purpose = 'email-verification',
  expiresInMinutes = 5,
}: VerifyOtpEmailProps) {
  const copy = COPY[purpose];

  return (
    <BaseLayout
      preview={`${code} is your Frugal ${purpose === 'sign-in' ? 'sign-in' : 'verification'} code`}
      hero={
        // The code is this email's entire payload, so it gets the display slot
        // rather than sitting in a box below a headline.
        <HeroBand
          eyebrow={copy.eyebrow}
          figure={code}
          caption={`Expires in ${expiresInMinutes} minutes · single use`}
          spacedFigure
        />
      }
    >
      <Hero heading={copy.heading} accent={copy.accent}>
        {copy.body}
      </Hero>

      <Text style={styles.next}>{copy.next}</Text>

      <Divider spacing="22px" />

      <Text style={styles.notice}>
        <strong style={styles.noticeStrong}>Didn&apos;t request this?</strong>{' '}
        Ignore this email — the code expires on its own and nothing happens
        until it&apos;s used. Frugal staff will never ask you for it.
      </Text>

      <Text style={styles.help}>
        Stuck, or the code isn&apos;t working?{' '}
        <Link href="mailto:support@getfrugal.dev" style={styles.helpLink}>
          Email support
        </Link>{' '}
        and a person will pick it up.
      </Text>
    </BaseLayout>
  );
}

export default VerifyOtpEmail;

export function verifyOtpSubject({ purpose = 'email-verification' }: VerifyOtpEmailProps): string {
  return COPY[purpose].subject;
}

export function verifyOtpText({
  code,
  purpose = 'email-verification',
  expiresInMinutes = 5,
}: VerifyOtpEmailProps): string {
  const copy = COPY[purpose];
  return [
    copy.subject,
    '',
    `    ${code}`,
    '',
    `This code expires in ${expiresInMinutes} minutes and can only be used once.`,
    '',
    copy.body,
    '',
    copy.next,
    '',
    "Didn't request this? Ignore this email — the code expires on its own and nothing happens until it's used. Frugal staff will never ask you for it.",
    '',
    "Stuck, or the code isn't working? Email support@getfrugal.dev and a person will pick it up.",
  ].join('\n');
}

const styles = {
  next: {
    color: color.textMuted,
    fontSize: '15px',
    lineHeight: '24px',
    margin: `0`,
  },
  notice: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `0 0 ${space.sm}`,
  },
  noticeStrong: {
    color: color.text,
    fontWeight: 600,
  },
  help: {
    color: color.textSubtle,
    fontSize: '13px',
    lineHeight: '20px',
    margin: 0,
  },
  helpLink: {
    color: color.primary,
    textDecoration: 'underline',
  },
} as const;
