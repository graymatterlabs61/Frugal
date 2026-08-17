import { Hr } from '@react-email/components';
import { color, space } from '../../lib/tokens.js';

export function Divider({ spacing = space.lg }: { spacing?: string }) {
  return (
    <Hr
      className="e-hr"
      style={{
        borderColor: color.border,
        borderStyle: 'solid',
        borderWidth: '1px 0 0',
        margin: `${spacing} 0`,
      }}
    />
  );
}
