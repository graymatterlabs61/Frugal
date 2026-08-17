import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { color, font, space, SITE_URL } from '../../lib/tokens.js';

interface BaseLayoutProps {
  /** Inbox preview line. Shown next to the subject — always set it deliberately. */
  preview: string;
  children: ReactNode;
  /** Marketing emails must pass an unsubscribe URL (CAN-SPAM / GDPR). */
  unsubscribeUrl?: string;
}

export function BaseLayout({ preview, children, unsubscribeUrl }: BaseLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>{preview}</title>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .e-body { background-color: ${color.bgDark} !important; }
            .e-surface { background-color: ${color.surfaceDark} !important; }
            .e-text { color: ${color.textDark} !important; }
            .e-muted { color: ${color.textMutedDark} !important; }
            .e-border { border-color: ${color.borderDark} !important; }
            .e-hr { border-color: ${color.borderDark} !important; }
            .e-subtle { background-color: ${color.bgDark} !important; }
          }
          @media only screen and (max-width: 600px) {
            .e-pad { padding-left: 20px !important; padding-right: 20px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="e-body" style={styles.body}>
        <Container style={styles.container}>
          {/* Wordmark — text, not an image: images are blocked by default in
              many clients, and a blocked logo makes the email look broken. */}
          <Section className="e-pad" style={styles.header}>
            <Link href={SITE_URL} style={styles.wordmark}>
              Frugal
            </Link>
          </Section>

          <Section className="e-surface e-border" style={styles.card}>
            <Section className="e-pad" style={styles.content}>
              {children}
            </Section>
          </Section>

          <Section className="e-pad" style={styles.footer}>
            <Hr className="e-hr" style={styles.footerRule} />
            <Text className="e-muted" style={styles.footerText}>
              Frugal — AI API cost management
              <br />
              Gray Matter Labs, Inc.
            </Text>
            <Text className="e-muted" style={styles.footerText}>
              <Link href={SITE_URL} style={styles.footerLink}>
                getfrugal.dev
              </Link>
              {' · '}
              <Link href={`${SITE_URL}/privacy`} style={styles.footerLink}>
                Privacy
              </Link>
              {' · '}
              <Link href={`${SITE_URL}/terms`} style={styles.footerLink}>
                Terms
              </Link>
              {unsubscribeUrl ? (
                <>
                  {' · '}
                  <Link href={unsubscribeUrl} style={styles.footerLink}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: color.bg,
    fontFamily: font.sans,
    margin: 0,
    padding: `${space.lg} 0`,
    WebkitFontSmoothing: 'antialiased' as const,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    padding: `0 ${space.xl} ${space.md}`,
  },
  wordmark: {
    color: color.primary,
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    textDecoration: 'none',
  },
  card: {
    backgroundColor: color.surface,
    border: `1px solid ${color.border}`,
    borderRadius: '12px',
    overflow: 'hidden' as const,
  },
  content: {
    padding: space.xl,
  },
  footer: {
    padding: `${space.md} ${space.xl} 0`,
  },
  footerRule: {
    borderColor: color.border,
    borderStyle: 'solid' as const,
    borderWidth: '1px 0 0',
    margin: `0 0 ${space.md}`,
  },
  footerText: {
    color: color.textSubtle,
    fontSize: '12px',
    lineHeight: '18px',
    margin: `0 0 ${space.sm}`,
  },
  footerLink: {
    color: color.textSubtle,
    textDecoration: 'underline',
  },
} as const;
