import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Hero } from '../components/blocks/hero.js';
import { CodeBlock } from '../components/blocks/code-block.js';
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
    <BaseLayout preview={`${code} is your Frugal verification code`}>
      <Hero eyebrow="Verify your email" heading="Enter this code to continue">
        Type this code into the verification screen you already have open. It
        expires in {expiresInMinutes} minutes.
      </Hero>

      <CodeBlock code={code} />

      <Text className="e-muted" style={styles.notice}>
        Frugal staff will never ask you for this code. If you didn&apos;t try to
        sign up or verify an email, you can ignore this message — nothing
        happens until the code is used.
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
