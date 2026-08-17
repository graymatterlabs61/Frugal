import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Hero } from '../components/blocks/hero.js';
import { HeroBand } from '../components/blocks/hero-band.js';
import { color, space } from '../lib/tokens.js';

export interface VerifyOtpEmailProps {
  code: string;
  /** Minutes until the code expires. */
  expiresInMinutes?: number;
}

/**
 * Email verification via one-time code.
 *
 * No link and no CTA button by design — a code-only email can't be turned into
 * a phishing click, and there's nothing for a scanner to consume by prefetching.
 */
export function VerifyOtpEmail({ code, expiresInMinutes = 5 }: VerifyOtpEmailProps) {
  return (
    <BaseLayout
      preview={`${code} is your Frugal verification code`}
      hero={
        // The code is this email's entire payload, so it gets the display slot
        // rather than sitting in a box below a headline.
        <HeroBand
          eyebrow="Verify your email"
          figure={code}
          caption={`Expires in ${expiresInMinutes} minutes · single use`}
          spacedFigure
        />
      }
    >
      <Hero heading="Enter this code to" accent="continue">
        Type it into the verification screen you already have open. Nothing
        happens on your account until the code is used.
      </Hero>

      <Text style={styles.notice}>
        Frugal staff will never ask you for this code. If you didn&apos;t try to
        sign up or verify an email, you can safely ignore this message.
      </Text>
    </BaseLayout>
  );
}

export default VerifyOtpEmail;

export const verifyOtpSubject = 'Verify your Frugal email';

export function verifyOtpText({ code, expiresInMinutes = 5 }: VerifyOtpEmailProps): string {
  return [
    `Your Frugal verification code is: ${code}`,
    '',
    `It expires in ${expiresInMinutes} minutes.`,
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
