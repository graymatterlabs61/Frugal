import { Text } from '@react-email/components';
import { color, font, space } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

/**
 * Large OTP display. Letter-spaced so digits are easy to read and transcribe,
 * and selectable text (not an image) so it can be copied on mobile.
 */
export function CodeBlock({ code }: { code: string }) {
  return (
    // Padding on the <td> — Outlook ignores it on the wrapping <table>.
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.outer}>
      <tbody>
        <tr>
          <td align="center" style={styles.wrap} {...bgAttr(color.surfaceRaised)}>
            <Text style={styles.code}>{code}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  outer: {
    margin: `16px 0 24px`,
  },
  wrap: {
    backgroundColor: color.surfaceRaised,
    border: `1px solid ${color.borderStrong}`,
    borderRadius: '10px',
    padding: `${space.lg} ${space.md}`,
    textAlign: 'center' as const,
  },
  code: {
    color: color.text,
    fontFamily: font.mono,
    fontSize: '34px',
    fontWeight: 600,
    letterSpacing: '0.32em',
    lineHeight: '42px',
    margin: 0,
    // Trailing letter-space offsets optical centering; nudge it back
    paddingLeft: '0.32em',
  },
} as const;
