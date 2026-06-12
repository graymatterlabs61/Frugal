import type { Metadata } from "next"
import { LegalLayout, LegalSection, LegalList, LegalCard } from "@/components/legal"

export const metadata: Metadata = {
  title: "Cookie Policy | Frugal",
  description: "How Frugal uses cookies and similar technologies.",
}

const SECTIONS = [
  { id: "scope", title: "Scope of Application" },
  { id: "technologies", title: "Technologies Used" },
  { id: "usage", title: "How we use them" },
  { id: "managing", title: "Managing Preferences" },
]

const COOKIES = [
  {
    category: "Essential",
    purpose: "Authentication, security, and load balancing.",
    retention: "Session",
  },
  {
    category: "Functional",
    purpose: "Preferences, currency settings, and theme.",
    retention: "1 Year",
  },
  {
    category: "Analytics",
    purpose: "Performance metrics and spend visualization.",
    retention: "2 Years",
  },
]

export default function CookiesPage() {
  return (
    <LegalLayout
      title={
        <>
          Legal <br />
          <em className="text-[#4a2a1a] italic font-light">and</em> Policies
        </>
      }
      subtitle="Transparent and comprehensive documentation regarding data processing, cookie usage, and financial transactions at Frugal."
      dateLabel="COOKIE POLICY"
      sections={SECTIONS}
    >
      <LegalSection id="scope" num={1} title="Scope of Application">
        <p>
          This Cookie Policy applies to all Frugal platforms, including our main
          application dashboard, API documentation, and marketing assets. By
          continuing to browse our site, you agree to our use of cookies as
          described herein. We are committed to transparency in our data processing
          practices.
        </p>
      </LegalSection>

      <LegalSection id="technologies" num={2} title="Technologies Used">
        <p>
          Frugal uses cookies, web beacons, and other tracking technologies to
          provide a seamless cloud cost monitoring experience. These can be
          categorized as follows:
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Purpose
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Retention
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COOKIES.map((c) => (
                <tr key={c.category} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium text-white">{c.category}</td>
                  <td className="px-6 py-4 text-muted-foreground/80">{c.purpose}</td>
                  <td className="px-6 py-4 text-muted-foreground/80">{c.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="usage" num={3} title="How we use them">
        <p>
          We leverage these technologies to ensure that your Frugal experience is
          optimized. Specifically:
        </p>

        <LegalList>
          <li>
            <strong className="text-white">Security:</strong> We use cookies to verify
            your identity and prevent fraudulent access to your spend dashboard.
          </li>
          <li>
            <strong className="text-white">Performance:</strong> Analyzing which cloud
            regions are being monitored most frequently helps us optimize our
            ingestion engine.
          </li>
          <li>
            <strong className="text-white">Preferences:</strong> Remembering your graph
            layouts and alert thresholds so you don&apos;t have to reconfigure them
            every visit.
          </li>
        </LegalList>

        <LegalCard
          title="Privacy Note"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          }
        >
          Frugal never sells your cookie data to third-party advertisers. All
          analytical data is anonymized and used strictly for platform improvement
          and system health monitoring.
        </LegalCard>
      </LegalSection>

      <LegalSection id="managing" num={4} title="Managing Preferences">
        <p>
          You can control and delete cookies through your browser settings.
          Disabling strictly necessary cookies will prevent you from logging
          into the Service. Most browsers allow you to block cookies from specific sites or all sites.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}