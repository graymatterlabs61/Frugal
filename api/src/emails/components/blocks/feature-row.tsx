import { Column, Row, Text } from '@react-email/components';
import { color, space } from '../../lib/tokens.js';

interface FeatureRowProps {
  /** Single glyph or short emoji. Text, not an image — images are blocked by default in many clients. */
  glyph?: string;
  title: string;
  description?: string;
}

export function FeatureRow({ glyph = '→', title, description }: FeatureRowProps) {
  return (
    <Row style={styles.row}>
      <Column style={styles.glyphCol}>
        <Text style={styles.glyph}>{glyph}</Text>
      </Column>
      <Column>
        <Text className="e-text" style={styles.title}>
          {title}
        </Text>
        {description ? (
          <Text className="e-muted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </Column>
    </Row>
  );
}

const styles = {
  row: {
    marginBottom: space.md,
  },
  glyphCol: {
    verticalAlign: 'top' as const,
    width: '28px',
  },
  glyph: {
    color: color.primary,
    fontSize: '15px',
    lineHeight: '22px',
    margin: 0,
  },
  title: {
    color: color.text,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '22px',
    margin: 0,
  },
  description: {
    color: color.textMuted,
    fontSize: '14px',
    lineHeight: '21px',
    margin: `2px 0 0`,
  },
} as const;
