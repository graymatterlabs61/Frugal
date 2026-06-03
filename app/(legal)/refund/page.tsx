import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Refund Policy | Frugal",
  description: "Frugal refund and cancellation policy.",
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

export default function RefundPage() {
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
            Refund Policy
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-foreground">
          Refund Policy
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Last updated: June 3, 2025 · Gray Matter Labs, Inc. (Delaware, USA)
        </p>

        <div className="space-y-10">
          <Section title="1. Pre-Launch (Current Status)">
            <p>
              Frugal is currently in pre-launch. No payments are being
              processed at this time. Joining the waitlist is free and does not
              create any financial obligation.
            </p>
            <p>
              This refund policy will become effective when paid plans are
              launched.
            </p>
          </Section>

          <Section title="2. 14-Day Money-Back Guarantee">
            <p>
              When Frugal launches, new subscribers will be eligible for a full
              refund within{" "}
              <strong className="text-foreground">14 calendar days</strong> of
              their first paid subscription, provided:
            </p>
            <UL>
              <li>
                This is your first paid subscription to Frugal (not a plan
                upgrade or renewal).
              </li>
              <li>
                The refund request is submitted within 14 days of the initial
                charge.
              </li>
              <li>
                Your account has not violated our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
                .
              </li>
            </UL>
            <p>
              To request a refund, email{" "}
              <a
                href="mailto:hello@frugal.so"
                className="text-primary hover:underline"
              >
                hello@frugal.so
              </a>{" "}
              with the subject line &ldquo;Refund Request&rdquo; from the email
              address associated with your account.
            </p>
          </Section>

          <Section title="3. Subscription Renewals">
            <p>
              Subscription renewals (monthly or annual) are not eligible for
              refunds. You may cancel your subscription at any time to prevent
              future renewals. Cancellation takes effect at the end of your
              current billing period.
            </p>
          </Section>

          <Section title="4. Cancellation">
            <UL>
              <li>
                You may cancel your subscription at any time from your account
                settings.
              </li>
              <li>
                Cancellation takes effect at the end of the current billing
                period. You retain access until then.
              </li>
              <li>
                We do not offer partial or pro-rated refunds for unused days
                within a billing period, except at our discretion.
              </li>
              <li>
                If you cancel an annual plan within the first 30 days, we may
                offer a pro-rated refund at our discretion. Contact{" "}
                <a
                  href="mailto:hello@frugal.so"
                  className="text-primary hover:underline"
                >
                  hello@frugal.so
                </a>
                .
              </li>
            </UL>
          </Section>

          <Section title="5. Waitlist Discount Codes">
            <p>
              Waitlist discount codes (e.g., EARLY35) are applied as a discount
              to the first monthly or annual invoice. If a refund is issued on
              that first invoice, the discount code is considered used and will
              not be reissued.
            </p>
          </Section>

          <Section title="6. Exceptions">
            <p>
              We reserve the right to deny refund requests in cases of:
            </p>
            <UL>
              <li>Violation of our Terms of Service</li>
              <li>
                Fraudulent activity or abuse of the refund policy (e.g.,
                repeated subscribe-refund patterns)
              </li>
              <li>
                Accounts that have been suspended or terminated for cause
              </li>
            </UL>
          </Section>

          <Section title="7. Refund Processing">
            <p>
              Approved refunds are processed within 5–10 business days and
              returned to the original payment method. Processing time may vary
              depending on your bank or card issuer.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              For refund requests or questions about this policy:
            </p>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-1.5">
              <p className="font-semibold text-foreground">
                Gray Matter Labs, Inc.
              </p>
              <p>Registered in Delaware, USA</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:hello@frugal.so"
                  className="text-primary hover:underline"
                >
                  hello@frugal.so
                </a>
              </p>
              <p>Subject: Refund Request — [your account email]</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}