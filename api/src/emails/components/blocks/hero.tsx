import { Heading, Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, font, space } from '../../lib/tokens.js';

interface HeroProps {
  /** Small uppercase label above the heading. */
  eyebrow?: string;
  heading: string;
  /**
   * Trailing fragment rendered in serif italic, mirroring the landing page's
   * headline treatment ("Stop getting surprised *by AI bills*"). Georgia is
   * universally available, so this needs no webfont.
   */
  accent?: string;
  children?: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}

const toneColor = {
  default: color.primary,
  danger: color.danger,
  warning: color.warning,
  success: color.success,
} as const;

export function Hero({ eyebrow, heading, accent, children, tone = 'default' }: HeroProps) {
  return (
    <>
      {eyebrow ? (
        <Text style={{ ...styles.eyebrow, color: toneColor[tone] }}>
          <span style={styles.eyebrowDot}>●</span> {eyebrow}
        </Text>
      ) : null}
      {/* Real h1 — screen readers rely on heading levels, not font size */}
      <Heading as="h1" className="e-h1" style={styles.heading}>
        {heading}
        {accent ? (
          <>
            {' '}
            <span style={styles.accent}>{accent}</span>
          </>
        ) : null}
      </Heading>
      {children ? <Text style={styles.body}>{children}</Text> : null}
    </>
  );
}

const styles = {
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    margin: `0 0 ${space.md}`,
    textTransform: 'uppercase' as const,
  },
  eyebrowDot: {
    fontSize: '8px',
    verticalAlign: 'middle' as const,
  },
  heading: {
    color: color.text,
    fontFamily: font.sans,
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.025em',
    lineHeight: '36px',
    margin: `0 0 ${space.md}`,
  },
  accent: {
    color: color.text,
    fontFamily: font.serif,
    fontStyle: 'italic' as const,
    fontWeight: 400,
  },
  body: {
    color: color.textMuted,
    // 17/27 rather than 15/25 — body copy at this size reads as something a
    // person wrote, which is most of the difference between these and a
    // system notification.
    fontSize: '17px',
    lineHeight: '27px',
    margin: `0 0 ${space.lg}`,
  },
} as const;
