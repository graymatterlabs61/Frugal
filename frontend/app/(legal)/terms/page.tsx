import type { Metadata } from "next"
import { LegalLayout, LegalSection, LegalList, LegalCard } from "@/components/legal"

export const metadata: Metadata = {
  title: "Terms of Service | Frugal",
  description:
    "Read Frugal's Terms of Service. Understand your rights and obligations when using Frugal AI API cost management.",
  alternates: { canonical: "https://getfrugal.dev/terms" },
}

const SECTIONS = [
  { id: "acceptable-usage", title: "Acceptable Usage" },
  { id: "liability-limits", title: "Liability Limits" },
  { id: "payment-protocol", title: "Payment Protocol" },
  { id: "data-protection", title: "Data Protection" },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title={
        <>
          Terms <em className="text-primary italic">of</em>
          <br />
          Service
        </>
      }
      subtitle="Governing the intersection of capital and computation."
      dateLabel="DOCUMENT RELEASE V2.4"
      sections={SECTIONS}
    >
      <LegalSection id="acceptable-usage" num={1} title="Acceptable Usage">
        <p>
          Frugal is designed to help organizations monitor, manage, and optimize
          their AI API expenditures. By creating an account, you agree to the
          following operational standards:
        </p>

        <LegalCard
          title="Account Security"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          }
        >
          You are solely responsible for maintaining the confidentiality of your
          API keys and login credentials. Any activity conducted through your
          account is deemed your legal responsibility.
        </LegalCard>

        <LegalCard
          title="Prohibited Use"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          }
        >
          You may not use Frugal for any unlawful purpose, including but not
          limited to, attempting to circumvent provider-imposed API limits or
          reverse engineering the Frugal platform.
        </LegalCard>

        <LegalCard
          title="Notice on Termination"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        >
          Frugal reserves the right to suspend or terminate access immediately if
          usage patterns suggest abuse or non-compliance with regional data laws,
          specifically the Digital Personal Data Protection (DPDP) Act 2023.
        </LegalCard>
      </LegalSection>

      <LegalSection id="liability-limits" num={2} title="Liability Limits">
        <p>
          To the maximum extent permitted by law, Frugal and Gray Matter Labs
          shall not be held liable for any indirect, incidental, special, or
          consequential damages resulting from the use of our services.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <LegalCard
            title="Service Uptime"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          >
            We do not guarantee 100% uptime. While we strive for excellence, we
            are not liable for costs incurred due to system downtime or API sync
            delays.
          </LegalCard>

          <LegalCard
            title="Third-Party APIs"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            }
          >
            Frugal acts as a middleware. Any billing disputes with third-party
            providers must be resolved directly with said providers.
          </LegalCard>
        </div>
      </LegalSection>

      <LegalSection id="payment-protocol" num={3} title="Payment Protocol">
        <p>
          Frugal offers various subscription tiers for individual developers and
          large-scale enterprises. Our billing is handled through verified
          processors including Stripe and Lemon Squeezy.
        </p>

        <LegalList>
          <li>
            <strong className="text-white">7-Day Refund Window:</strong> We
            offer a no-questions-asked 7-day refund window for all new SaaS
            subscriptions to build trust and reduce disputes.
          </li>
          <li>
            <strong className="text-white">Global Tax Compliance:</strong> GST
            of 18% is applicable to Indian business customers. Export of services
            to overseas customers is zero-rated under GST regulations.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="data-protection" num={4} title="Data Protection">
        <p>
          Frugal processes sensitive personal data, including email addresses and
          API keys. We adhere strictly to the Digital Personal Data Protection
          (DPDP) Act 2023 and GDPR mandates.
        </p>

        <LegalCard
          title="Global Compliance Commitments"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Explicit consent-based collection
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Essential-only data processing
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Right to erasure and data purging
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Valid DPAs with all processors
            </div>
          </div>
        </LegalCard>
      </LegalSection>
    </LegalLayout>
  )
}