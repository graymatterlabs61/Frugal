/**
 * Email design tokens.
 *
 * Hex only — email clients don't support oklch(), which the web app uses.
 * Values mirror web/app/globals.css: primary #FF500B, dark surfaces in the
 * 270-hue family. Light base with dark-mode overrides in base-layout, since
 * Outlook's Word engine ignores @media and would render a dark-only email as
 * light background + light text.
 */
export const color = {
  primary: '#FF500B',
  primaryDark: '#e04409',
  primaryFg: '#ffffff',

  // Light (default)
  bg: '#f4f4f5',
  surface: '#ffffff',
  text: '#18181b',
  textMuted: '#52525b',
  textSubtle: '#71717a',
  border: '#e4e4e7',

  // Dark (media-query overrides)
  bgDark: '#09090f',
  surfaceDark: '#121218',
  textDark: '#f4f4f5',
  textMutedDark: '#a1a1aa',
  borderDark: '#27272e',

  // Semantic
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  warning: '#d97706',
  warningBg: '#fffbeb',
  success: '#059669',
  successBg: '#ecfdf5',
} as const;

export const font = {
  sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

export const space = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const SITE_URL = 'https://getfrugal.dev';
