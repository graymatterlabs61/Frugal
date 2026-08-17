import { Heading, Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, space } from '../../lib/tokens.js';

interface HeroProps {
  /** Small uppercase label above the heading (optional). */
  eyebrow?: string;
  heading: string;
  children?: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}

const eyebrowColor = {
  default: color.primary,
  danger: color.danger,
  warning: color.warning,
  success: color.success,
} as const;

export function Hero({ eyebrow, heading, children, tone = 'default' }: HeroProps) {
  return (
    <>
      {eyebrow ? (
        <Text style={{ ...styles.eyebrow, color: eyebrowColor[tone] }}>{eyebrow}</Text>
      ) : null}
      {/* h1 per email a11y: screen readers rely on real heading levels */}
      <Heading as="h1" className="e-text" style={styles.heading}>
        {heading}
      </Heading>
      {children ? (
        <Text className="e-muted" style={styles.body}>
          {children}
        </Text>
      ) : null}
    </>
  );
}

const styles = {
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    margin: `0 0 ${space.sm}`,
    textTransform: 'uppercase' as const,
  },
  heading: {
    color: color.text,
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: '32px',
    margin: `0 0 ${space.md}`,
  },
  body: {
    color: color.textMuted,
    fontSize: '15px',
    lineHeight: '24px',
    margin: `0 0 ${space.lg}`,
  },
} as const;
