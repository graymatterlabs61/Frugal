import { color, font } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

export interface BarRow {
  label: string;
  value: number;
  /** Preformatted display value, e.g. "$420.50". */
  display: string;
}

/**
 * Horizontal bar chart built from table cells.
 *
 * Charts in email have to be either an image or a table — an image costs a
 * request and is the first thing a client blocks, so this is a table. Each bar
 * is a two-cell row whose widths are percentages of the largest value, which
 * means it scales with the container and needs no fixed pixel maths.
 */
export function BarChart({ rows }: { rows: BarRow[] }) {
  const max = Math.max(...rows.map((r) => r.value), 0);

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={styles.outer}
    >
      <tbody>
        {rows.map((r) => {
          // Floor at 2% so a near-zero row is still visible as a bar
          const pct = max > 0 ? Math.max(2, Math.round((r.value / max) * 100)) : 0;
          return (
            <tr key={r.label}>
              <td style={styles.cell}>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                  <tbody>
                    <tr>
                      <td style={styles.label}>{r.label}</td>
                      <td align="right" style={styles.value}>
                        {r.display}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={styles.barCell}>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          border={0}
                          style={styles.barTable}
                        >
                          <tbody>
                            <tr>
                              {pct > 0 ? (
                                <td
                                  width={`${pct}%`}
                                  style={styles.barFill}
                                  {...bgAttr(color.primary)}
                                >
                                  &nbsp;
                                </td>
                              ) : null}
                              {/* Omitted at 100% — a zero-width cell still
                                  paints a hairline in some clients */}
                              {pct < 100 ? (
                                <td
                                  width={`${100 - pct}%`}
                                  style={styles.barTrack}
                                  {...bgAttr(color.border)}
                                >
                                  &nbsp;
                                </td>
                              ) : null}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const styles = {
  outer: {
    margin: '4px 0 8px',
  },
  cell: {
    paddingBottom: '14px',
  },
  label: {
    color: color.text,
    fontSize: '14px',
    lineHeight: '20px',
    paddingBottom: '6px',
  },
  value: {
    color: color.text,
    fontFamily: font.mono,
    fontSize: '14px',
    lineHeight: '20px',
    paddingBottom: '6px',
  },
  barCell: {
    fontSize: '1px',
    lineHeight: '1px',
  },
  barTable: {
    borderRadius: '2px',
    overflow: 'hidden' as const,
    tableLayout: 'fixed' as const,
  },
  barFill: {
    fontSize: '1px',
    height: '5px',
    lineHeight: '5px',
  },
  barTrack: {
    fontSize: '1px',
    height: '5px',
    lineHeight: '5px',
  },
} as const;
