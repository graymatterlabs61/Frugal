import type { Metadata } from "next"
import { LegalLayout, LegalSection, LegalList, LegalCard } from "@/components/legal"

export const metadata: Metadata = {
  title: "Refund Policy | Frugal",
  description: "Frugal refund and cancellation policy.",
}

const SECTIONS = [
  { id: "eligibility", title: "Refund Eligibility" },
  { id: "processing", title: "Refund Processing" },
  { id: "changes", title: "Subscription Changes" },
]

export default function RefundPage() {
  return (
    <LegalLayout
      title={
        <>
          Refund <em className="text-[#4a2a1a] italic font-light">Policy</em>
        </>
      }
      subtitle="Detailed information regarding subscriptions, satisfaction guarantees, and service credits."
      dateLabel="REFUND POLICY"
      sections={SECTIONS}
    >
      <LegalSection id="eligibility" num={1} title="Refund Eligibility">
        <p>
          At Frugal, we strive to provide the most accurate cloud cost forecasting
          tools. If our platform fails to meet the Service Level Agreement (SLA) or
          if you are unsatisfied with the initial experience, the following rules apply:
        </p>

        <LegalList>
          <li>
            <strong className="text-white">14-Day Satisfaction:</strong> New users are
            eligible for a full refund within the first 14 days of their initial
            subscription.
          </li>
          <li>
            <strong className="text-white">System Failures:</strong> If our cost guards
            fail to alert you based on your defined thresholds, a pro-rated credit will be issued.
          </li>
          <li>
            <strong className="text-white">Annual Plans:</strong> Refunds for annual plans
            are calculated based on the remaining full months of the term.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="processing" num={2} title="Refund Processing">
        <p>
          All refund requests must be submitted through the billing dashboard or via email to{" "}
          <a href="mailto:billing@getfrugal.dev" className="text-primary hover:underline">
            billing@getfrugal.dev
          </a>
          . Once approved, the funds will be returned to the original payment method.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <LegalCard
            title="Credit Card"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
          >
            Processing takes 5-10 business days depending on your bank provider.
          </LegalCard>

          <LegalCard
            title="Bank Transfer"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 21H2M3 21v-4M21 21v-4M6 17v-4M10 17v-4M14 17v-4M18 17v-4M2 7h20L12 2Z" />
              </svg>
            }
          >
            May take up to 15 business days for international settlements.
          </LegalCard>
        </div>
      </LegalSection>

      <LegalSection id="changes" num={3} title="Subscription Changes">
        <p>
          Downgrading your plan mid-cycle will result in a prorated credit applied to your
          next billing period. We do not offer cash refunds for mid-cycle plan downgrades
          unless specifically required by regional consumer protection laws.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}