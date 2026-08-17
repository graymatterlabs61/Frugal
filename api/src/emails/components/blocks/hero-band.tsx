import { Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, font } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

interface HeroBandProps {
  /** Small uppercase label, e.g. "BUDGET THRESHOLD". */
  eyebrow: string;
  /** The one number this email exists to deliver. */
  figure: string;
  /** Context under the figure, e.g. "of $1,000.00 · 84% used". */
  caption?: string;
  tone?: 'default' | 'danger' | 'warning' | 'success';
  /** Letter-space the figure — for OTP codes, where digits need to be transcribed. */
  spacedFigure?: boolean;
  children?: ReactNode;
}

/**
 * Full-bleed gradient header inside the card.
 *
 * The gradient is a background-image, with a solid `bgcolor` underneath:
 * Outlook's Word engine ignores background-image and falls back to the flat
 * brand-tinted colour, which still reads as deliberate. No VML needed for
 * that to look right.
 */
const gradient = {
  default: `linear-gradient(135deg, #3a1608 0%, #1c1119 48%, ${color.surface} 100%)`,
  danger: `linear-gradient(135deg, #3d1010 0%, #1e1016 48%, ${color.surface} 100%)`,
  warning: `linear-gradient(135deg, #3a2408 0%, #1d1512 48%, ${color.surface} 100%)`,
  success: `linear-gradient(135deg, #0d3325 0%, #101a18 48%, ${color.surface} 100%)`,
} as const;

/** Flat fallback, sampled from each gradient's midpoint. */
const solid = {
  default: '#241318',
  danger: '#261316',
  warning: '#251a12',
  success: '#0f2119',
} as const;

const accent = {
  default: color.primary,
  danger: color.danger,
  warning: color.warning,
  success: color.success,
} as const;

export function HeroBand({
  eyebrow,
  figure,
  caption,
  tone = 'default',
  spacedFigure = false,
  children,
}: HeroBandProps) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td
            style={{ ...styles.band, backgroundImage: gradient[tone] }}
            {...bgAttr(solid[tone])}
          >
            <Text style={{ ...styles.eyebrow, color: accent[tone] }}>{eyebrow}</Text>
            <Text
              className="e-display"
              style={spacedFigure ? { ...styles.figure, ...styles.figureSpaced } : styles.figure}
            >
              {figure}
            </Text>
            {caption ? <Text style={styles.caption}>{caption}</Text> : null}
            {children ? <div style={styles.extras}>{children}</div> : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  band: {
    borderBottom: `1px solid ${color.border}`,
    padding: '30px 32px 26px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    margin: '0 0 14px',
    textTransform: 'uppercase' as const,
  },
  figure: {
    color: color.text,
    fontFamily: font.mono,
    fontSize: '44px',
    fontWeight: 600,
    letterSpacing: '-0.04em',
    lineHeight: '50px',
    margin: 0,
  },
  figureSpaced: {
    letterSpacing: '0.22em',
  },
  caption: {
    color: color.textMuted,
    fontSize: '14px',
    lineHeight: '21px',
    margin: '8px 0 0',
  },
  extras: {
    paddingTop: '18px',
  },
} as const;
