import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Hero } from '../components/blocks/hero.js';
import { color, space } from '../lib/tokens.js';

export interface SupportReplyEmailProps {
  name?: string | undefined;
  /** Copy of what they sent, so they have a record of it. */
  message: string;
  /** Short reference, e.g. the contact-request row id. */
  reference?: string | undefined;
}

/**
 * Auto-acknowledgement for a contact-form submission.
 *
 * Sent from support@ (not noreply@) so a reply lands somewhere a human reads —
 * an auto-reply the user can't respond to is worse than none.
 */
export function SupportReplyEmail({ name, message, reference }: SupportReplyEmailProps) {
  return (
    <BaseLayout preview="We got your message — we reply within 24 hours on business days.">
      <Hero
        eyebrow="Support"
        heading={name ? `Thanks, ${name} — we got your message` : 'We got your message'}
      >
        A human reads every message that comes through. Expect a reply within 24
        hours on business days. You can reply directly to this email to add
        anything.
      </Hero>

      <Text className="e-muted" style={styles.label}>
        What you sent{reference ? ` · ${reference}` : ''}
      </Text>
      <Text className="e-muted e-subtle e-border" style={styles.quote}>
        {message}
      </Text>
    </BaseLayout>
  );
}

export default SupportReplyEmail;

export const supportReplySubject = 'We got your message — Frugal Support';

export function supportReplyText({ name, message, reference }: SupportReplyEmailProps): string {
  return [
    name ? `Thanks, ${name} — we got your message.` : 'We got your message.',
    '',
    'A human reads every message. Expect a reply within 24 hours on business days.',
    'You can reply directly to this email to add anything.',
    '',
    `What you sent${reference ? ` (${reference})` : ''}:`,
    message,
  ].join('\n');
}

const styles = {
  label: {
    color: color.textMuted,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    margin: `0 0 ${space.sm}`,
    textTransform: 'uppercase' as const,
  },
  quote: {
    backgroundColor: '#fafafa',
    border: `1px solid ${color.border}`,
    borderRadius: '8px',
    color: color.textMuted,
    fontSize: '14px',
    lineHeight: '22px',
    margin: 0,
    padding: space.md,
    whiteSpace: 'pre-wrap' as const,
  },
} as const;
