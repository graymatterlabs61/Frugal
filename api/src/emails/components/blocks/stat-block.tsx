import { Column, Row, Section, Text } from '@react-email/components';
import { color, font, space } from '../../lib/tokens.js';

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
    <Section className="e-border" style={styles.wrap}>
      <Row>
        {stats.map((s) => (
          <Column key={s.label} style={styles.col}>
            <Text className="e-muted" style={styles.label}>
              {s.label}
            </Text>
            <Text
              className={s.tone && s.tone !== 'default' ? undefined : 'e-text'}
              style={{ ...styles.value, color: valueColor[s.tone ?? 'default'] }}
            >
              {s.value}
            </Text>
            {s.delta ? (
              <Text className="e-muted" style={styles.delta}>
                {s.delta}
              </Text>
            ) : null}
          </Column>
        ))}
      </Row>
    </Section>
  );
}

const styles = {
  wrap: {
    border: `1px solid ${color.border}`,
    borderRadius: '8px',
    margin: `${space.md} 0 ${space.lg}`,
    padding: space.md,
  },
  col: {
    verticalAlign: 'top' as const,
  },
  label: {
    color: color.textMuted,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    margin: `0 0 ${space.xs}`,
    textTransform: 'uppercase' as const,
  },
  value: {
    fontFamily: font.mono,
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: '28px',
    margin: 0,
  },
  delta: {
    color: color.textMuted,
    fontSize: '12px',
    lineHeight: '18px',
    margin: `2px 0 0`,
  },
} as const;
