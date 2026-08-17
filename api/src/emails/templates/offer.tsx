import { Text } from '@react-email/components';
import { BaseLayout } from '../components/layout/base-layout.js';
import { Button } from '../components/layout/button.js';
import { Hero } from '../components/blocks/hero.js';
import { FeatureRow } from '../components/blocks/feature-row.js';
import { color, space, SITE_URL } from '../lib/tokens.js';

export interface OfferEmailProps {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Optional bullet points under the CTA. */
  points?: string[] | undefined;
  /** Optional code to show, e.g. a discount code. */
  code?: string | undefined;
  /** Small label above the heading. Omitted by default — the wordmark is right above it. */
  eyebrow?: string | undefined;
  /**
   * Required. This is a marketing email — CAN-SPAM and GDPR both require a
   * working opt-out, and Resend audiences supply the URL per recipient.
   */
  unsubscribeUrl: string;
}

/**
 * Marketing/promo email. Deliberately generic: content is passed in per
 * campaign rather than hardcoded, because promos change and templates shouldn't.
 *
 * Send this from the marketing address and to consented audiences only — never
 * mix it into transactional flows, or a spam complaint takes down auth mail too.
 */
export function OfferEmail({
  heading,
  body,
  ctaLabel,
  ctaUrl,
  points,
  code,
  eyebrow,
  unsubscribeUrl,
}: OfferEmailProps) {
  return (
    <BaseLayout preview={heading} unsubscribeUrl={unsubscribeUrl}>
      <Hero {...(eyebrow ? { eyebrow } : {})} heading={heading}>
        {body}
      </Hero>

      {code ? (
        <Text className="e-text e-subtle e-border" style={styles.code}>
          {code}
        </Text>
      ) : null}

      <Button href={ctaUrl}>{ctaLabel}</Button>

      {points?.length ? (
        <>
          <Text className="e-text" style={styles.sectionTitle}>
            What you get
          </Text>
          {points.map((p) => (
            <FeatureRow key={p} glyph="·" title={p} />
          ))}
        </>
      ) : null}
    </BaseLayout>
  );
}

export default OfferEmail;

export function offerText({ heading, body, ctaLabel, ctaUrl, code, points }: OfferEmailProps): string {
  const lines = [heading, '', body];
  if (code) lines.push('', `Code: ${code}`);
  if (points?.length) {
    lines.push('', 'What you get:');
    for (const p of points) lines.push(`  · ${p}`);
  }
  lines.push('', `${ctaLabel}: ${ctaUrl}`, '', `Frugal — ${SITE_URL}`);
  return lines.join('\n');
}

const styles = {
  code: {
    backgroundColor: '#fafafa',
    border: `1px dashed ${color.border}`,
    borderRadius: '8px',
    color: color.text,
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    margin: `0 0 ${space.lg}`,
    padding: space.md,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 700,
    margin: `${space.lg} 0 ${space.md}`,
  },
} as const;
