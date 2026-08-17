/**
 * Email design tokens — dark, matching getfrugal.dev.
 *
 * Hex only (email clients don't support the oklch() the web app uses), and the
 * dark palette is hard-coded rather than living behind a prefers-color-scheme
 * query: Outlook's Word engine ignores @media entirely, so a query-driven dark
 * theme renders there as light background + light text. Hard-coding means every
 * client shows the same thing.
 */
export const color = {
  primary: '#FF500B',
  primaryHover: '#ff6a30',
  primaryFg: '#ffffff',
  /** Orange at low alpha, pre-flattened over `surface` — email has no alpha blending in Outlook. */
  primarySoft: '#2a1710',
  primaryBorder: '#4a2415',

  /** Page background, behind the card. */
  bg: '#050508',
  /** Card / panel background. */
  surface: '#101016',
  /** Inset panels (code blocks, quotes) — one step up from surface. */
  surfaceRaised: '#181820',

  text: '#f4f4f5',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',

  border: '#26262e',
  borderStrong: '#35353f',

  danger: '#f87171',
  dangerSoft: '#2a1414',
  dangerBorder: '#4a1f1f',
  warning: '#fbbf24',
  warningSoft: '#2a2010',
  success: '#34d399',
  successSoft: '#0f2a20',
} as const;

export const font = {
  sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  /**
   * Serif italic accent, mirroring the landing page's headline treatment.
   * Instrument Serif is the site's face and loads via @import where supported;
   * Georgia is the fallback for Gmail, which strips webfonts.
   */
  serif: "'Instrument Serif', Georgia, 'Times New Roman', Times, serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace",
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
