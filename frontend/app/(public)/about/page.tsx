import type { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  LegalSection,
  LegalH3,
  LegalList,
  LegalCard,
  LegalContact,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "About Frugal — AI API Cost Management for Developers",
  description:
    "Learn how Frugal helps developers and AI teams monitor OpenAI, Anthropic, Replicate, and fal.ai spending with real-time dashboards, budget limits, and automated alerts.",
  alternates: { canonical: "https://getfrugal.dev/about" },
  openGraph: {
    title: "About Frugal — AI API Cost Management for Developers",
    description:
      "Frugal monitors your AI API spend in real time. Set budget limits, get alerts before costs spiral, and stop surprise invoices.",
    url: "https://getfrugal.dev/about",
  },
}

const SECTIONS = [
  { id: "what-is-frugal", title: "What is Frugal?" },
  { id: "the-problem", title: "The Problem" },
  { id: "how-it-works", title: "How it Works" },
  { id: "security", title: "Security" },
  { id: "who-its-for", title: "Who it's For" },
  { id: "the-team", title: "The Team" },
]

export default function AboutPage() {
  return (
    <LegalLayout
      title={
        <>
          About{" "}
          <em className="text-[#4a2a1a] italic font-light">Frugal</em>
        </>
      }
      subtitle="We build the cost management layer that AI providers forgot to ship."
      dateLabel="ABOUT US"
      sections={SECTIONS}
      variant="company"
    >
      <LegalSection id="what-is-frugal" num={1} title="What is Frugal?">
        <p>
          Frugal is an AI API cost management platform that connects to your AI provider accounts —
          OpenAI, Anthropic, Replicate, fal.ai — and gives you a unified real-time view of every
          dollar you&apos;re spending on inference.
        </p>
        <p>
          It polls provider usage APIs every five minutes, writes records to a normalized usage store,
          and evaluates your budget rules on every cycle. When a threshold is crossed, it fires alerts
          via email and Slack before your billing period closes.
        </p>
        <LegalCard
          title="One dashboard. All providers."
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          }
        >
          No more logging into four separate billing dashboards. Frugal aggregates spend across every
          provider your application uses, broken down by project, team, and day.
        </LegalCard>
      </LegalSection>

      <LegalSection id="the-problem" num={2} title="The Problem">
        <p>
          The modern AI development stack is powerful but financially opaque. OpenAI, Anthropic,
          Replicate, and fal.ai were built to let you build — not to help you track what that
          building costs. Their billing dashboards show you last month&apos;s invoice. They don&apos;t
          tell you when you&apos;re about to blow your budget <em>this</em> month.
        </p>
        <LegalH3>What&apos;s missing from every AI provider</LegalH3>
        <LegalList>
          <li>No native cross-provider spend aggregation</li>
          <li>No proactive budget threshold alerts</li>
          <li>No per-project or per-team cost attribution</li>
          <li>No anomaly detection for unexpected usage spikes</li>
          <li>No way to enforce a hard spending limit before damage is done</li>
        </LegalList>
        <p>
          By the time you see an invoice, the month is over. Frugal gives you the information
          you need when it&apos;s still actionable.
        </p>
      </LegalSection>

      <LegalSection id="how-it-works" num={3} title="How it Works">
        <p>
          Connect your AI provider accounts with read-only API credentials. Frugal validates each
          connection, begins polling usage data every five minutes via a QStash-triggered worker, and
          surfaces that data in a unified dashboard.
        </p>
        <LegalH3>Three steps to cost control</LegalH3>
        <LegalList>
          <li>
            <strong className="text-white">Connect</strong> — paste your provider API keys. Frugal
            encrypts them with AES-256 before they touch the database.
          </li>
          <li>
            <strong className="text-white">Configure</strong> — set monthly limits per provider.
            Alert at 80%, 90%, 100% — or any threshold you choose. Per-project and per-team support.
          </li>
          <li>
            <strong className="text-white">Relax</strong> — Frugal polls every 5 minutes and fires
            Slack and email alerts the moment you cross a threshold.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="security" num={4} title="Security">
        <p>
          Frugal handles API credentials on behalf of its users. We take that responsibility seriously.
        </p>
        <LegalList>
          <li>All API keys encrypted with AES-256 before storage — never appear in plaintext</li>
          <li>Keys never logged, never exposed in API responses, never client-accessible</li>
          <li>Read-only permission model — we query usage data, we don&apos;t make inference requests</li>
          <li>Row-level security enforced on all database tables via Supabase RLS</li>
          <li>TLS/HTTPS for all data in transit</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="who-its-for" num={5} title="Who it&apos;s For">
        <p>
          Frugal is built for developers, product teams, and AI startups who have moved past
          prototyping and are running AI workloads in production.
        </p>
        <LegalH3>You&apos;ll get the most from Frugal if you</LegalH3>
        <LegalList>
          <li>Build production applications powered by OpenAI, Anthropic, Replicate, or fal.ai</li>
          <li>Manage multiple AI providers and want unified visibility</li>
          <li>Need to report AI infrastructure costs to a finance team or investor</li>
          <li>Have received a surprise AI invoice at least once</li>
          <li>Run multiple projects with separate budget accountability</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="the-team" num={6} title="The Team">
        <p>
          Frugal is a product of{" "}
          <strong className="text-white">Gray Matter Labs, Inc.</strong> — a small, focused software
          studio building infrastructure tools for the modern development stack. We believe AI-powered
          products should be financially sustainable, not just technically impressive.
        </p>
        <p className="mt-4">
          We built our <Link href="/" className="text-primary hover:underline">AI API cost management dashboard</Link> because we were tired of surprise bills and fragmented usage data.
        </p>
        <LegalContact>
          <p className="font-semibold text-white">Nilesh Kumar — Founder</p>
          <p>
            <a href="https://x.com/neilkumaroff" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              @neilkumaroff on X
            </a>
          </p>
          <p>
            General:{" "}
            <a href="mailto:hello@getfrugal.dev" className="text-primary hover:underline">
              hello@getfrugal.dev
            </a>
          </p>
        </LegalContact>
      </LegalSection>

      <div className="mt-24 flex flex-col sm:flex-row gap-4">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_20px_#FF500B4D]"
        >
          Start monitoring free &rarr;
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center border border-white/10 text-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
        >
          Contact us
        </Link>
      </div>
    </LegalLayout>
  )
}
