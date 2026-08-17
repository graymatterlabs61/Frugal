import { Button as REButton } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, space } from '../../lib/tokens.js';

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  /** Inline pill instead of the default full-width block. */
  inline?: boolean;
}

/**
 * Full-width by default. A block CTA spanning the content column is far harder
 * to miss than an inline pill, and it removes the thumb-target problem on
 * mobile without needing a separate mobile style.
 */
export function Button({ href, children, variant = 'primary', inline = false }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <REButton
      href={href}
      style={{
        backgroundColor: isPrimary ? color.primary : color.surfaceRaised,
        border: isPrimary ? `1px solid ${color.primary}` : `1px solid ${color.borderStrong}`,
        borderRadius: '10px',
        color: isPrimary ? color.primaryFg : color.text,
        display: inline ? 'inline-block' : 'block',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '22px',
        padding: inline ? '13px 26px' : '15px 26px',
        textAlign: 'center' as const,
        textDecoration: 'none',
        margin: `${space.sm} 0`,
        ...(inline ? {} : { width: '100%' }),
      }}
    >
      {children}
    </REButton>
  );
}
