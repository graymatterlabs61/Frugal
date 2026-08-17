import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';
import { color, font, space, SITE_URL } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

interface BaseLayoutProps {
  /** Inbox preview line, shown next to the subject. Always set it deliberately. */
  preview: string;
  children: ReactNode;
  /** Marketing emails must pass an unsubscribe URL (CAN-SPAM / GDPR). */
  unsubscribeUrl?: string;
}

/**
 * Structure is deliberately flat. Every react-email <Section> renders a
 * <table>, and nesting them to fake a padded card breaks: border-radius with
 * overflow:hidden does not clip a nested table in any email client. So the
 * card is one table with its own padding, and spacing between blocks comes
 * from explicit spacer rows rather than margins on nested elements.
 */
export function BaseLayout({ preview, children, unsubscribeUrl }: BaseLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>{preview}</title>
        {/* Declaring dark-only stops iOS Mail and Outlook.com force-inverting a
            design that is already dark — inversion is what breaks dark emails. */}
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style>{`
          /* Apple Mail, iOS Mail and Outlook.com honour @import webfonts;
             Gmail strips it and falls back to Georgia, which is why the serif
             stack is a real fallback rather than a decoration. */
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
          :root { color-scheme: dark; supported-color-schemes: dark; }
          body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
          table { border-collapse:collapse; }
          a { text-decoration:none; }
          img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
          @media only screen and (max-width: 620px) {
            .e-card { padding:26px 22px !important; }
            .e-h1 { font-size:25px !important; line-height:33px !important; }
            .e-figure { font-size:24px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body} {...bgAttr(color.bg)}>
        <Container style={styles.container}>
          {/* Logo is a PNG with the page background baked in, not an SVG: no
              email client renders SVG, and a baked background beats relying on
              alpha compositing in Outlook. */}
          <Section style={styles.header}>
            <Row>
              <Column style={styles.logoCol}>
                <Link href={SITE_URL}>
                  <Img
                    src={`${SITE_URL}/email/logo@4x.png`}
                    width="34"
                    height="25"
                    alt="Frugal"
                    style={styles.logo}
                  />
                </Link>
              </Column>
              <Column style={styles.wordmarkCol}>
                <Link href={SITE_URL} style={styles.wordmark}>
                  Frugal
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Hand-rolled table rather than <Section>: react-email puts `style`
              on the <table>, and padding on a table is ignored by Outlook and
              inconsistent elsewhere. Padding has to live on the <td>. */}
          <table
            role="presentation"
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            style={styles.cardTable}
          >
            <tbody>
              <tr>
                <td className="e-card" style={styles.card} {...bgAttr(color.surface)}>
                  {children}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Explicit spacer row — padding on a <Section> lands on its <table>,
              which Outlook ignores. A sized empty row always holds. */}
          <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
            <tbody>
              <tr>
                <td style={styles.spacer}>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>
              <Link href={SITE_URL} style={styles.footerBrandLink}>
                Frugal
              </Link>
              <span style={styles.footerTagline}>&nbsp;&nbsp;·&nbsp;&nbsp;AI API cost management</span>
            </Text>
            <Text style={styles.footerLinks}>
              <Link href={`${SITE_URL}/dashboard`} style={styles.footerLink}>
                Dashboard
              </Link>
              <span style={styles.footerSep}>&nbsp;&nbsp;&nbsp;</span>
              <Link href={`${SITE_URL}/contact`} style={styles.footerLink}>
                Support
              </Link>
              <span style={styles.footerSep}>&nbsp;&nbsp;&nbsp;</span>
              <Link href={`${SITE_URL}/privacy`} style={styles.footerLink}>
                Privacy
              </Link>
              <span style={styles.footerSep}>&nbsp;&nbsp;&nbsp;</span>
              <Link href={`${SITE_URL}/terms`} style={styles.footerLink}>
                Terms
              </Link>
              {unsubscribeUrl ? (
                <>
                  <span style={styles.footerSep}>&nbsp;&nbsp;&nbsp;</span>
                  <Link href={unsubscribeUrl} style={styles.footerLink}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </Text>
            <Text style={styles.footerLegal}>
              © {new Date().getFullYear()} Gray Matter Labs, Inc.
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
    padding: `${space.xl} ${space.md} ${space.xxl}`,
    WebkitFontSmoothing: 'antialiased' as const,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    paddingBottom: '18px',
  },
  logoCol: {
    verticalAlign: 'middle' as const,
    width: '44px',
  },
  logo: {
    display: 'block' as const,
  },
  wordmarkCol: {
    verticalAlign: 'middle' as const,
  },
  wordmark: {
    color: color.text,
    fontSize: '17px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    textDecoration: 'none',
  },
  cardTable: {
    width: '100%',
  },
  card: {
    backgroundColor: color.surface,
    // Left accent stripe instead of a full top bar — reads as brand
    // furniture rather than a stray line, and survives clients that
    // collapse a 3px-tall row.
    borderLeft: `3px solid ${color.primary}`,
    borderTop: `1px solid ${color.border}`,
    borderRight: `1px solid ${color.border}`,
    borderBottom: `1px solid ${color.border}`,
    borderRadius: '12px',
    padding: `30px 32px 26px`,
  },
  spacer: {
    fontSize: '1px',
    height: '26px',
    lineHeight: '26px',
  },
  footer: {
    paddingTop: 0,
  },
  footerBrand: {
    margin: `0 0 12px`,
  },
  footerBrandLink: {
    color: color.textMuted,
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  footerTagline: {
    color: color.textSubtle,
    fontSize: '13px',
  },
  footerLinks: {
    margin: `0 0 14px`,
  },
  footerLink: {
    color: color.textMuted,
    fontSize: '12px',
    textDecoration: 'none',
  },
  footerSep: {
    fontSize: '12px',
  },
  footerLegal: {
    color: color.textSubtle,
    fontSize: '11px',
    lineHeight: '17px',
    margin: 0,
  },
} as const;
