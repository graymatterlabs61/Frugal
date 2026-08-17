import { Text } from '@react-email/components';
import { color, space } from '../../lib/tokens.js';

/**
 * Human sign-off.
 *
 * A named closing is the cheapest thing that stops an email reading as machine
 * output — worth more than most of the visual treatment above it.
 */
export function Signoff({ line = 'Thanks,', from = 'The Frugal team' }: { line?: string; from?: string }) {
  return (
    <Text style={styles.wrap}>
      {line}
      <br />
      <span style={styles.from}>— {from}</span>
    </Text>
  );
}

const styles = {
  wrap: {
    color: color.textMuted,
    fontSize: '17px',
    lineHeight: '27px',
    margin: `${space.lg} 0 0`,
  },
  from: {
    color: color.text,
    fontWeight: 600,
  },
} as const;
