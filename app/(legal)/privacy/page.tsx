import type { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  LegalSection,
  LegalH3,
  LegalList,
  LegalContact,
  LegalCard,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Privacy Policy | Frugal",
  description:
    "How Gray Matter Labs, Inc. collects, uses, and protects your personal information when you use Frugal AI API cost management.",
  alternates: { canonical: "https://frugal.so/privacy" },
}

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "information-collection", title: "Information Collection" },
  { id: "data-usage", title: "How We Use Your Data" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "security", title: "Data Security" },
  { id: "retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights" },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title={
        <>
          Privacy <em className="text-[#4a2a1a] italic font-light">Policy</em>
        </>
      }
      subtitle="How Gray Matter Labs, Inc. collects, uses, and protects your personal information."
      dateLabel="PRIVACY POLICY"
      sections={SECTIONS}
    >
      <LegalSection id="introduction" num={1} title="Introduction">
        <p>
          Gray Matter Labs, Inc. (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates Frugal, an AI API
          cost management service (the &ldquo;Service&rdquo;). This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          personal information when you use our Service or visit our website.
        </p>
        <p>
          Gray Matter Labs, Inc. is incorporated in the State of Delaware,
          United States. By using the Service, you agree to the practices
          described in this Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection id="information-collection" num={2} title="Information Collection">
        <LegalH3>Information You Provide</LegalH3>
        <LegalList>
          <li>
            <strong className="text-white">Email address</strong> — when
            you join our waitlist, create an account, or contact us.
          </li>
          <li>
            <strong className="text-white">API keys</strong> — provided to
            connect your AI provider accounts. Encrypted with AES-256 before
            storage and never appear in plaintext in our systems.
          </li>
          <li>
            <strong className="text-white">Payment information</strong> —
            processed by Stripe. We do not store card numbers or payment
            credentials on our servers.
          </li>
          <li>
            <strong className="text-white">Profile information</strong> —
            name and any other details you provide when creating an account.
          </li>
        </LegalList>

        <LegalH3>Information Collected Automatically</LegalH3>
        <LegalList>
          <li>
            <strong className="text-white">Usage data</strong> — pages
            visited, features used, timestamps of actions.
          </li>
          <li>
            <strong className="text-white">Log data</strong> — IP address,
            browser type, referring URLs, and other technical identifiers.
          </li>
          <li>
            <strong className="text-white">Cookies and local storage</strong>{" "}
            — session tokens and user preferences. See our{" "}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>{" "}
            for details.
          </li>
        </LegalList>

        <LegalCard
          title="AI Provider Usage Data"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        >
          When you connect an AI provider account (e.g., OpenAI, Anthropic), we
          retrieve usage and cost data from that provider&apos;s API on your
          behalf. This data is stored in your account and used solely to provide
          the monitoring functionality.
        </LegalCard>
      </LegalSection>

      <LegalSection id="data-usage" num={3} title="How We Use Your Data">
        <LegalList>
          <li>To provide, operate, and improve the Service.</li>
          <li>
            To send transactional communications: account confirmations, budget
            alert notifications, and billing receipts.
          </li>
          <li>
            To send waitlist and launch updates (you can unsubscribe at any
            time).
          </li>
          <li>To respond to support requests and communications.</li>
          <li>
            To comply with legal obligations and enforce our Terms of Service.
          </li>
          <li>To detect and prevent fraud, abuse, and security incidents.</li>
          <li>To analyze usage patterns and improve product features.</li>
        </LegalList>
        <p className="mt-6 text-white font-medium">
          We do not sell your personal information to third parties. We do not
          use your data to train AI or machine learning models.
        </p>
      </LegalSection>

      <LegalSection id="data-sharing" num={4} title="Data Sharing">
        <p>We may share your information with:</p>
        <LegalList>
          <li>
            <strong className="text-white">Service providers</strong> —
            Vercel (hosting), Supabase (database), Upstash (caching), Stripe
            (payments), Resend (email delivery). These providers process data
            only as necessary to provide their services to us.
          </li>
          <li>
            <strong className="text-white">Legal requirements</strong> —
            when required by law, court order, or governmental authority.
          </li>
          <li>
            <strong className="text-white">Business transfers</strong> —
            in connection with a merger, acquisition, or sale of assets, with
            advance notice to you.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="security" num={5} title="Data Security">
        <p>We implement industry-standard security measures including:</p>
        <LegalList>
          <li>AES-256 encryption for all stored API keys</li>
          <li>TLS/HTTPS encryption for all data in transit</li>
          <li>
            Row-level security (RLS) on all database tables — no row accessible
            without authenticated user context
          </li>
          <li>Strict access controls and authentication requirements</li>
        </LegalList>
        <p className="mt-6">
          No method of internet transmission is 100% secure. We take
          commercially reasonable precautions to protect your data, but cannot
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection id="retention" num={6} title="Data Retention">
        <p>
          We retain your personal information for as long as your account is
          active or as needed to provide the Service. You may request deletion
          of your account and associated data at any time by contacting us. We
          will delete or anonymize your data within 30 days, except where
          retention is required by law.
        </p>
        <p>
          Waitlist email addresses are retained until you unsubscribe or request
          deletion.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" num={7} title="Your Rights">
        <LegalH3>General Rights</LegalH3>
        <LegalList>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate personal information</li>
          <li>Request deletion of your personal information</li>
          <li>Object to or restrict processing of your personal information</li>
          <li>
            Receive your data in a machine-readable format (data portability)
          </li>
          <li>
            Withdraw consent at any time where processing is based on consent
          </li>
        </LegalList>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <LegalCard
            title="GDPR Rights"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            }
          >
            If you are located in the EEA or UK, you have additional rights. Our
            legal basis for processing includes performance of a contract,
            legitimate interests, and consent.
          </LegalCard>

          <LegalCard
            title="CCPA Rights"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M12 3v18" />
              </svg>
            }
          >
            California residents can request to know what data is collected,
            request deletion, and opt out of data sales (we do not sell data).
          </LegalCard>
        </div>
      </LegalSection>

      <div className="mt-24 space-y-16">
        <LegalH3>Additional Information</LegalH3>
        
        <div>
          <h4 className="font-semibold text-white mb-2">Children&apos;s Privacy</h4>
          <p className="text-sm md:text-[15px] leading-loose text-muted-foreground/90 font-light">
            The Service is not directed to children under 16. We do not knowingly
            collect personal information from children under 16. If you believe we
            have inadvertently collected such information, please contact us
            immediately.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">International Transfers</h4>
          <p className="text-sm md:text-[15px] leading-loose text-muted-foreground/90 font-light">
            Your information may be transferred to and processed in the United
            States and other countries where our service providers operate. When
            transferring data from the EEA or UK, we rely on Standard Contractual
            Clauses or other appropriate safeguards as required by applicable law.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact Us</h4>
          <LegalContact>
            <p className="font-semibold text-white">
              Gray Matter Labs, Inc.
            </p>
            <p>Registered Agent in the State of Delaware, USA</p>
            <p>
              Privacy inquiries:{" "}
              <a
                href="mailto:privacy@getfrugal.dev"
                className="text-primary hover:underline"
              >
                privacy@getfrugal.dev
              </a>
            </p>
            <p>
              General:{" "}
              <a
                href="mailto:hello@getfrugal.dev"
                className="text-primary hover:underline"
              >
                hello@getfrugal.dev
              </a>
            </p>
          </LegalContact>
        </div>
      </div>
    </LegalLayout>
  )
}