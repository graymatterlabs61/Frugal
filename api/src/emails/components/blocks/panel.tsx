import type { ReactNode } from 'react';
import { color } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

/**
 * Raised panel nested inside the card.
 *
 * Gives templates that have no hero band (no single number to lead with) the
 * same sense of depth the data emails get from the gradient — page, card, and
 * panel read as three distinct layers rather than one flat rectangle.
 */
export function Panel({ children }: { children: ReactNode }) {
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
        <tr>
          <td style={styles.panel} {...bgAttr(color.surfaceRaised)}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  outer: {
    margin: '0 0 22px',
  },
  panel: {
    backgroundColor: color.surfaceRaised,
    border: `1px solid ${color.border}`,
    borderRadius: '12px',
    padding: '24px 24px 22px',
  },
} as const;
