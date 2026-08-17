import { Button as REButton } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, space } from '../../lib/tokens.js';

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <REButton
      href={href}
      style={{
        backgroundColor: isPrimary ? color.primary : 'transparent',
        border: isPrimary ? 'none' : `1px solid ${color.border}`,
        borderRadius: '8px',
        color: isPrimary ? color.primaryFg : color.text,
        display: 'inline-block',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: '20px',
        // react-email renders padding into a table for Outlook; keep it explicit
        padding: '12px 24px',
        textDecoration: 'none',
        margin: `${space.sm} 0`,
      }}
    >
      {children}
    </REButton>
  );
}
