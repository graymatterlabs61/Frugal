import type { Metadata } from "next"
import type { ReactNode } from "react"
import { LegalLayout, LegalSection, LegalH3, LegalList, LegalCard, LegalContact } from "@/components/legal"
import { Mail, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Frugal — Get in Touch",
  description:
    "Have questions about Frugal AI API cost management? Reach out to our team at support@getfrugal.dev — we respond within 24 hours.",
  alternates: { canonical: "https://getfrugal.dev/contact" },
  openGraph: {
    title: "Contact Frugal — Get in Touch",
    description: "Have questions about Frugal? Reach out to our team — we respond within 24 hours.",
    url: "https://getfrugal.dev/contact",
  },
}

const SECTIONS = [
  { id: "get-in-touch", title: "Get in Touch" },
  { id: "response-times", title: "Response Times" },
  { id: "faq", title: "Quick Answers" },
]

type Channel = { icon: ReactNode; label: string; value: string; href: string; description: string }

const CHANNELS: Channel[] = [
  {
    icon: <Mail size={18} className="text-primary" />,
    label: "Support",
    value: "support@getfrugal.dev",
    href: "mailto:support@getfrugal.dev",
    description: "Product questions, bug reports, billing issues.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.264 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: "Twitter / X",
    value: "@neilkumaroff",
    href: "https://x.com/neilkumaroff",
    description: "Quick questions and product updates.",
  },
  {
    icon: <MessageSquare size={18} className="text-primary" />,
    label: "Feedback",
    value: "feedback@getfrugal.dev",
    href: "mailto:feedback@getfrugal.dev",
    description: "Feature requests, ideas, and general feedback.",
  },
]

export default function ContactPage() {
  return (
    <LegalLayout
      title={
        <>
          Get in{" "}
          <em className="text-[#4a2a1a] italic font-light">Touch</em>
        </>
      }
      subtitle="We're a small team and we read every message. Expect a reply within 24 hours on business days."
      dateLabel="CONTACT US"
      sections={SECTIONS}
      variant="company"
    >
      <LegalSection id="get-in-touch" num={1} title="Get in Touch">
        <p>
          Reach us through any of the channels below. For account or billing issues, email is
          fastest. For quick product questions, Twitter / X works well.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-1">
          {CHANNELS.map(({ icon, label, value, href, description }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:border-primary/20 hover:bg-primary/[0.03] transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-1">
                  {label}
                </p>
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors mb-1">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  {description}
                </p>
              </div>
              <svg className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="response-times" num={2} title="Response Times">
        <LegalList>
          <li>
            <strong className="text-white">Email support</strong> — typically within 24 hours on
            business days (Mon–Fri, GMT+5:30).
          </li>
          <li>
            <strong className="text-white">Bug reports</strong> — critical bugs acknowledged within
            4 hours, fix timeline depends on severity.
          </li>
          <li>
            <strong className="text-white">Feature requests</strong> — reviewed weekly and tracked
            in our roadmap. No SLA, but we read everything.
          </li>
          <li>
            <strong className="text-white">Twitter / X</strong> — best-effort during waking hours.
            Not monitored for support SLAs.
          </li>
        </LegalList>

        <LegalCard
          title="Enterprise support"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        >
          Corporate plans (targeting Q3 2026) will include a dedicated Slack support channel and
          response SLAs. Email us to register interest and get founding-customer pricing.
        </LegalCard>
      </LegalSection>

      <LegalSection id="faq" num={3} title="Quick Answers">
        <p>
          Common questions before you write in.
        </p>

        <LegalH3>How fast does Frugal update?</LegalH3>
        <p>
          Usage data is polled every 5 minutes from provider APIs. Your dashboard reflects near
          real-time spend with up to a 5-minute lag.
        </p>

        <LegalH3>Is there a free plan?</LegalH3>
        <p>
          Yes. The Free plan covers one API connection and one project, forever. Plus ($19/mo)
          and Pro ($49/mo) unlock more connections, budget rules, Slack alerts, and longer history.
        </p>

        <LegalH3>What happens to my API keys?</LegalH3>
        <p>
          Keys are encrypted with AES-256 before storage, never logged, and never exposed
          client-side. Frugal uses a read-only permissions model — we query usage data only.
        </p>

        <LegalH3>Can I delete my account?</LegalH3>
        <p>
          Yes, at any time. Email{" "}
          <a href="mailto:support@getfrugal.dev" className="text-primary hover:underline">
            support@getfrugal.dev
          </a>{" "}
          and we&apos;ll delete your account and all associated data within 30 days.
        </p>

        <LegalContact>
          <p>
            Still have questions?{" "}
            <a href="mailto:support@getfrugal.dev" className="text-primary hover:underline">
              support@getfrugal.dev
            </a>
          </p>
        </LegalContact>
      </LegalSection>
    </LegalLayout>
  )
}
