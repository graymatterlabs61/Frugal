import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
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
const COPY: Record<OtpPurpose, { eyebrow: string; subject: string; heading: string; accent: string; body: string }> = {
  'email-verification': {
    eyebrow: 'Verify your email',
    subject: 'Verify your Frugal email',
    heading: 'Enter this code to',
    accent: 'continue',
    body: 'Type it into the verification screen you already have open. Nothing happens on your account until the code is used.',
  },
  'sign-in': {
    eyebrow: 'Sign in',
    subject: 'Your Frugal sign-in code',
    heading: 'Enter this code to',
    accent: 'sign in',
    body: 'Type it into the sign-in screen you already have open. It works once and only for this attempt.',
  },
  'forget-password': {
    eyebrow: 'Password reset',
    subject: 'Your Frugal password reset code',
    heading: 'Enter this code to reset your',
    accent: 'password',
    body: 'Type it into the reset screen to choose a new password. Your current password stays active until you do.',
  },
  'change-email': {
    eyebrow: 'Confirm new address',
    subject: 'Confirm your new Frugal email address',
    heading: 'Enter this code to confirm your new',
    accent: 'address',
    body: 'Type it into the screen you already have open. Your account keeps using the old address until this is confirmed.',
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

      <Text style={styles.notice}>
        Frugal staff will never ask you for this code. If you didn&apos;t request
        it, you can safely ignore this message.
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
  return [
    `${COPY[purpose].subject}: ${code}`,
    '',
    `It expires in ${expiresInMinutes} minutes and can only be used once.`,
    '',
    "Frugal staff will never ask you for this code. If you didn't request it, ignore this email.",
  ].join('\n');
}

const styles = {
  notice: {
    color: color.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: `${space.md} 0 0`,
  },
} as const;
