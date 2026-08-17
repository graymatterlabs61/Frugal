import { Column, Row, Text } from '@react-email/components';
import { color, font, space } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

interface FeatureRowProps {
  /**
   * Short marker shown in the badge — a step number ("1") or a glyph.
   * Text rather than an icon image: icons would be a second network request
   * per row and are the first thing a client blocks.
   */
  glyph?: string;
  title: string;
  description?: string;
}

export function FeatureRow({ glyph = '·', title, description }: FeatureRowProps) {
  return (
    <Row style={styles.row}>
      <Column style={styles.badgeCol}>
        {/* Fixed-size badge built as a table cell so Outlook keeps the box */}
        <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
          <tbody>
            <tr>
              <td
                width="26"
                height="26"
                align="center"
                style={styles.badge}
                {...bgAttr(color.primarySoft)}
              >
                <span style={styles.badgeText}>{glyph}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Column>
      <Column style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </Column>
    </Row>
  );
}

const styles = {
  row: {
    marginBottom: space.md,
  },
  badgeCol: {
    verticalAlign: 'top' as const,
    width: '40px',
  },
  textCol: {
    verticalAlign: 'top' as const,
  },
  badge: {
    backgroundColor: color.primarySoft,
    border: `1px solid ${color.primaryBorder}`,
    borderRadius: '7px',
    height: '26px',
    width: '26px',
  },
  badgeText: {
    color: color.primary,
    fontFamily: font.mono,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '26px',
  },
  title: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '23px',
    margin: `1px 0 0`,
  },
  description: {
    color: color.textMuted,
    fontSize: '14px',
    lineHeight: '22px',
    margin: `3px 0 0`,
  },
} as const;
