import { Column, Row, Section, Text } from '@react-email/components';
import { color, font, space } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

export interface Stat {
  label: string;
  value: string;
  /** Optional delta line, e.g. "↑ 12% vs last week". */
  delta?: string;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}

const valueColor = {
  default: color.text,
  danger: color.danger,
  warning: color.warning,
  success: color.success,
} as const;

/** Row of 1-3 figures. More than 3 wraps badly on mobile — keep it short. */
export function StatBlock({ stats }: { stats: Stat[] }) {
  return (
    // Padding lives on the <td>, not the wrapping <table>: Outlook drops
    // table padding, which leaves the figures flush against the border.
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.outer}>
      <tbody>
        <tr>
          <td style={styles.wrap} {...bgAttr(color.surfaceRaised)}>
            <Section>
              <Row>
                {stats.map((s) => (
                  <Column key={s.label} style={styles.col}>
                    <Text style={styles.label}>{s.label}</Text>
                    <Text
                      className="e-figure"
                      style={{ ...styles.value, color: valueColor[s.tone ?? 'default'] }}
                    >
                      {s.value}
                    </Text>
                    {s.delta ? <Text style={styles.delta}>{s.delta}</Text> : null}
                  </Column>
                ))}
              </Row>
            </Section>
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
    border: `1px solid ${color.border}`,
    borderRadius: '10px',
    padding: `18px 20px 14px`,
  },
  col: {
    verticalAlign: 'top' as const,
  },
  label: {
    color: color.textSubtle,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    margin: `0 0 6px`,
    textTransform: 'uppercase' as const,
  },
  value: {
    fontFamily: font.mono,
    fontSize: '23px',
    fontWeight: 600,
    letterSpacing: '-0.03em',
    lineHeight: '28px',
    margin: 0,
  },
  delta: {
    color: color.textSubtle,
    fontSize: '12px',
    lineHeight: '18px',
    margin: `4px 0 0`,
  },
} as const;
