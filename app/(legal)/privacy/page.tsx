import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Frugal",
  description:
    "How Gray Matter Labs, Inc. collects, uses, and protects your personal information.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-medium text-foreground">{children}</h3>
  )
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1.5">{children}</ul>
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-card/20 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Frugal
          </Link>
          <span className="font-heading text-sm font-medium text-foreground">
            Privacy Policy
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Last updated: June 3, 2025 · Gray Matter Labs, Inc. (Delaware, USA)
        </p>

        <div className="space-y-10">
          <Section title="1. Introduction">
            <p>
              Gray Matter Labs, Inc. (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates Frugal, an AI
              API cost management service (the &ldquo;Service&rdquo;). This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your personal information when you use our Service or
              visit our website.
            </p>
            <p>
              Gray Matter Labs, Inc. is incorporated in the State of Delaware,
              United States. By using the Service, you agree to the practices
              described in this Privacy Policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <H3>2.1 Information You Provide</H3>
            <UL>
              <li>
                <strong className="text-foreground">Email address</strong> —
                when you join our waitlist, create an account, or contact us.
              </li>
              <li>
                <strong className="text-foreground">API keys</strong> —
                provided to connect your AI provider accounts. These are
                encrypted with AES-256 before storage and never appear in
                plaintext in our systems.
              </li>
              <li>
                <strong className="text-foreground">Payment information</strong>{" "}
                — processed by Stripe. We do not store card numbers or payment
                credentials on our servers.
              </li>
              <li>
                <strong className="text-foreground">Profile information</strong>{" "}
                — name and any other details you provide when creating an
                account.
              </li>
            </UL>

            <H3>2.2 Information Collected Automatically</H3>
            <UL>
              <li>
                <strong className="text-foreground">Usage data</strong> —
                pages visited, features used, timestamps of actions.
              </li>
              <li>
                <strong className="text-foreground">Log data</strong> — IP
                address, browser type, referring URLs, and other technical
                identifiers.
              </li>
              <li>
                <strong className="text-foreground">
                  Cookies and local storage
                </strong>{" "}
                — session tokens and user preferences. See our{" "}
                <Link href="/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>{" "}
                for details.
              </li>
            </UL>

            <H3>2.3 AI Provider Usage Data</H3>
            <p>
              When you connect an AI provider account (e.g., OpenAI,
              Anthropic), we retrieve usage and cost data from that
              provider&apos;s API on your behalf. This data is stored in your
              account and used solely to provide the monitoring functionality.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <UL>
              <li>To provide, operate, and improve the Service.</li>
              <li>
                To send transactional communications: account confirmations,
                budget alert notifications, and billing receipts.
              </li>
              <li>
                To send waitlist and launch updates (you can unsubscribe at any
                time).
              </li>
              <li>To respond to support requests and communications.</li>
              <li>
                To comply with legal obligations and enforce our Terms of
                Service.
              </li>
              <li>To detect and prevent fraud, abuse, and security incidents.</li>
              <li>To analyze usage patterns and improve product features.</li>
            </UL>
            <p>
              We do not sell your personal information to third parties. We do
              not use your data to train AI or machine learning models.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We may share your information with:</p>
            <UL>
              <li>
                <strong className="text-foreground">Service providers</strong>{" "}
                — Vercel (hosting), Supabase (database), Upstash (caching),
                Stripe (payments), Resend (email delivery). These providers
                process data only as necessary to provide their services to us.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements</strong>{" "}
                — when required by law, court order, or governmental authority.
              </li>
              <li>
                <strong className="text-foreground">Business transfers</strong>{" "}
                — in connection with a merger, acquisition, or sale of assets,
                with advance notice to you.
              </li>
            </UL>
          </Section>

          <Section title="5. Data Security">
            <p>We implement industry-standard security measures including:</p>
            <UL>
              <li>AES-256 encryption for all stored API keys</li>
              <li>TLS/HTTPS encryption for all data in transit</li>
              <li>
                Row-level security (RLS) on all database tables — no row
                accessible without authenticated user context
              </li>
              <li>Strict access controls and authentication requirements</li>
            </UL>
            <p>
              No method of internet transmission is 100% secure. We take
              commercially reasonable precautions to protect your data, but
              cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal information for as long as your account
              is active or as needed to provide the Service. You may request
              deletion of your account and associated data at any time by
              contacting us. We will delete or anonymize your data within 30
              days, except where retention is required by law.
            </p>
            <p>
              Waitlist email addresses are retained until you unsubscribe or
              request deletion.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <H3>7.1 General Rights</H3>
            <p>You have the right to:</p>
            <UL>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your personal information</li>
              <li>
                Receive your data in a machine-readable format (data
                portability)
              </li>
              <li>
                Withdraw consent at any time where processing is based on
                consent
              </li>
            </UL>

            <H3>7.2 GDPR Rights (EEA / UK Residents)</H3>
            <p>
              If you are located in the European Economic Area or the United
              Kingdom, you have additional rights under the GDPR or UK GDPR.
              Our legal basis for processing your data includes: performance of
              a contract (providing the Service), legitimate interests (fraud
              prevention, product improvement), and consent (marketing
              communications). To exercise your rights, contact{" "}
              <a
                href="mailto:privacy@frugal.so"
                className="text-primary hover:underline"
              >
                privacy@frugal.so
              </a>
              .
            </p>

            <H3>7.3 CCPA Rights (California Residents)</H3>
            <p>
              California residents have the right to: know what personal
              information is collected; request deletion; opt out of the
              &ldquo;sale&rdquo; of personal information (we do not sell
              personal information); and non-discrimination for exercising these
              rights. Submit requests to{" "}
              <a
                href="mailto:privacy@frugal.so"
                className="text-primary hover:underline"
              >
                privacy@frugal.so
              </a>
              .
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              We use cookies and similar technologies. See our{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>{" "}
              for full details.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to children under 16. We do not
              knowingly collect personal information from children under 16. If
              you believe we have inadvertently collected such information,
              please contact us immediately.
            </p>
          </Section>

          <Section title="10. International Transfers">
            <p>
              Your information may be transferred to and processed in the
              United States and other countries where our service providers
              operate. When transferring data from the EEA or UK, we rely on
              Standard Contractual Clauses or other appropriate safeguards as
              required by applicable law.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by updating the &ldquo;Last
              updated&rdquo; date and, where appropriate, by email. Your
              continued use of the Service after changes become effective
              constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-1.5">
              <p className="font-semibold text-foreground">
                Gray Matter Labs, Inc.
              </p>
              <p>Registered Agent in the State of Delaware, USA</p>
              <p>
                Privacy inquiries:{" "}
                <a
                  href="mailto:privacy@frugal.so"
                  className="text-primary hover:underline"
                >
                  privacy@frugal.so
                </a>
              </p>
              <p>
                General:{" "}
                <a
                  href="mailto:hello@frugal.so"
                  className="text-primary hover:underline"
                >
                  hello@frugal.so
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}