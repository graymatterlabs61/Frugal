import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Frugal",
  description: "Terms of Service for Frugal — Gray Matter Labs, Inc.",
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

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1.5">{children}</ul>
}

export default function TermsPage() {
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
            Terms of Service
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Last updated: June 3, 2025 · Gray Matter Labs, Inc. (Delaware, USA)
        </p>

        <div className="space-y-10">
          <Section title="1. Agreement to Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally
              binding agreement between you and Gray Matter Labs, Inc.
              (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;), a Delaware corporation. By accessing or using
              Frugal (the &ldquo;Service&rdquo;), you agree to be bound by
              these Terms. If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Frugal is an AI API cost management platform that allows users to
              monitor spend across AI providers (OpenAI, Anthropic, Replicate,
              fal.ai, and others), configure budget rules, and receive alerts
              when spend thresholds are reached.
            </p>
            <p>
              The Service is intended for developers, engineering teams, and
              businesses that use AI API services. You must be at least 18
              years of age and have the authority to bind your organization (if
              applicable) to use the Service.
            </p>
          </Section>

          <Section title="3. Accounts and Registration">
            <UL>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                You must provide accurate and complete information when creating
                an account.
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your
                account.
              </li>
              <li>
                One account per person or organization; shared credentials
                between organizations are prohibited.
              </li>
            </UL>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <UL>
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable law or regulation.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service
                or its infrastructure.
              </li>
              <li>
                Reverse engineer, decompile, or attempt to extract the source
                code of the Service.
              </li>
              <li>
                Use the Service to store or transmit malicious code, viruses,
                or harmful data.
              </li>
              <li>
                Resell, sublicense, or redistribute the Service without our
                written consent.
              </li>
              <li>
                Use the Service in a manner that imposes an unreasonable or
                disproportionate load on our infrastructure.
              </li>
              <li>
                Submit third-party API keys that you do not own or have
                permission to use.
              </li>
            </UL>
          </Section>

          <Section title="5. API Keys and Third-Party Services">
            <p>
              By connecting API keys to Frugal, you represent and warrant that
              you own those keys or have authorization from the key owner to
              use them with our Service.
            </p>
            <p>
              We store API keys encrypted with AES-256. You understand that
              connecting API keys grants Frugal read-only access to usage and
              billing data from the respective provider. We will not use your
              keys to make API calls other than reading usage data.
            </p>
            <p>
              You remain solely responsible for your use of third-party AI
              APIs and any costs incurred with those providers.
            </p>
          </Section>

          <Section title="6. Subscription and Payment">
            <p>
              Frugal is currently in pre-launch. Paid plans will be available
              at launch. When subscription services become available:
            </p>
            <UL>
              <li>
                Subscriptions are billed monthly or annually in advance.
              </li>
              <li>
                All fees are non-refundable except as specified in our{" "}
                <Link href="/refund" className="text-primary hover:underline">
                  Refund Policy
                </Link>
                .
              </li>
              <li>
                We may change subscription pricing with 30 days&apos; advance
                notice.
              </li>
              <li>
                Failure to pay may result in suspension or termination of
                access.
              </li>
              <li>
                Waitlist discount codes (e.g., EARLY35) are valid for one use
                per account, on the first paid plan only, and cannot be
                combined with other offers.
              </li>
            </UL>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The Service, including all content, features, functionality,
              trademarks, and underlying software, is owned by Gray Matter
              Labs, Inc. and protected by intellectual property laws.
            </p>
            <p>
              You retain ownership of all data you submit to the Service. You
              grant us a limited, non-exclusive license to process your data as
              necessary to provide the Service.
            </p>
            <p>
              You may not use our name, logo, or trademarks without prior
              written consent.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted,
              error-free, or accurate at all times. Spend data is retrieved
              from third-party providers and may be subject to delays,
              inaccuracies, or outages beyond our control. Frugal is a
              monitoring and alerting tool — you remain responsible for
              managing your own AI API costs.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GRAY MATTER
              LABS, INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
              PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM
              YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATED
              TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A)
              $100 USD OR (B) THE AMOUNTS PAID BY YOU TO US IN THE 12 MONTHS
              PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Gray Matter
              Labs, Inc. and its officers, directors, employees, and agents
              from and against any claims, liabilities, damages, losses, and
              expenses arising from your use of the Service, your violation of
              these Terms, or your violation of any third-party rights.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your account at any time for
              violation of these Terms, non-payment, or any other reason with
              or without notice.
            </p>
            <p>
              You may cancel your account at any time. Upon termination, your
              right to use the Service ceases. We will delete your data in
              accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="12. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by the laws of the State of Delaware,
              United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Before initiating any formal legal proceeding, you agree to first
              contact us at{" "}
              <a
                href="mailto:legal@frugal.so"
                className="text-primary hover:underline"
              >
                legal@frugal.so
              </a>{" "}
              and attempt to resolve the dispute informally for 30 days.
            </p>
            <p>
              Any dispute that cannot be resolved informally shall be resolved
              by binding arbitration in Delaware in accordance with the American
              Arbitration Association&apos;s Commercial Arbitration Rules. You
              waive the right to participate in class action lawsuits or
              class-wide arbitration.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you
              of material changes by email or prominent notice on the Service.
              Continued use of the Service after changes become effective
              constitutes your acceptance.
            </p>
          </Section>

          <Section title="14. Contact">
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-1.5">
              <p className="font-semibold text-foreground">
                Gray Matter Labs, Inc.
              </p>
              <p>Registered in Delaware, USA</p>
              <p>
                Legal:{" "}
                <a
                  href="mailto:legal@frugal.so"
                  className="text-primary hover:underline"
                >
                  legal@frugal.so
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