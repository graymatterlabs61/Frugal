import { Section } from '@react-email/components';
import { color } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

interface ProgressBarProps {
  /** 0-100. Values above 100 are clamped for the fill but still colour as over-budget. */
  percent: number;
  tone?: 'default' | 'danger' | 'warning';
}

const fillColor = {
  default: color.primary,
  warning: color.warning,
  danger: color.danger,
} as const;

/**
 * Table-based bar with bgcolor attributes rather than a styled div: Outlook's
 * Word engine drops background-color on divs but honours the bgcolor attribute
 * on table cells, so this is the only shape that fills reliably everywhere.
 */
export function ProgressBar({ percent, tone = 'default' }: ProgressBarProps) {
  const filled = Math.max(0, Math.min(100, Math.round(percent)));
  const empty = 100 - filled;

  return (
    <Section style={styles.wrap}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={styles.table}
      >
        <tbody>
          <tr>
            {filled > 0 ? (
              <td width={`${filled}%`} {...bgAttr(fillColor[tone])} style={styles.cell}>
                &nbsp;
              </td>
            ) : null}
            {empty > 0 ? (
              <td width={`${empty}%`} {...bgAttr(color.border)} style={styles.cell}>
                &nbsp;
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

const styles = {
  wrap: {
    margin: '0 0 4px',
  },
  table: {
    borderCollapse: 'separate' as const,
    borderRadius: '3px',
    overflow: 'hidden' as const,
tableLayout: 'fixed' as const,
  },
  cell: {
    fontSize: '1px',
    height: '6px',
    lineHeight: '6px',
  },
} as const;
