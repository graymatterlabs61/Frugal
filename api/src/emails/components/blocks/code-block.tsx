import { Section, Text } from '@react-email/components';
import { color, font, space } from '../../lib/tokens.js';

/**
 * Large OTP display. Letter-spaced so digits are easy to read and transcribe,
 * and selectable as text (not an image) so it can be copied on mobile.
 */
export function CodeBlock({ code }: { code: string }) {
  return (
    <Section className="e-border e-subtle" style={styles.wrap}>
      <Text className="e-text" style={styles.code}>
      {code}
    </Text>
    </Section>
  );
}

const styles = {
  wrap: {
    backgroundColor: '#fafafa',
    border: `1px solid ${color.border}`,
    borderRadius: '8px',
    margin: `${space.md} 0 ${space.lg}`,
    padding: `${space.lg} ${space.md}`,
    textAlign: 'center' as const,
  },
  code: {
    color: color.text,
    fontFamily: font.mono,
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '0.3em',
    lineHeight: '40px',
    // Trailing letter-spacing offsets the visual centering; nudge it back
    margin: 0,
    paddingLeft: '0.3em',
  },
} as const;
