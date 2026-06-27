import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { MarketingNav } from "@/components/landing/MarketingNav"
import { Footer } from "@/components/landing/Footer"
import { FaqSection } from "@/components/landing/FaqSection"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

const pageTitle = "Monitor OpenAI API Costs in Real Time | Frugal"
const pageDescription =
  "Track OpenAI spend every 5 minutes. Set budget alerts. No proxy, no code changes. Free to start."

export const metadata: Metadata = {
  title: "The Ultimate OpenAI Spend Tracker for Engineering Teams",
  description: "Frugal connects directly to your OpenAI account to track spend in real-time, enforce budget limits, and alert you before unexpected bills occur.",
  alternates: { canonical: "https://getfrugal.dev/features/openai" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://getfrugal.dev/features/openai",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/twitter.png"],
  },
}

const faqs = [
  {
    col: 1,
    question: "What is Frugal?",
    answer: "Frugal is an AI API cost management platform that connects directly to your OpenAI account to track spend in real-time, enforce budget limits, and alert you before unexpected bills occur."
  },
  {
    col: 1,
    question: "Does Frugal act as a proxy?",
    answer: "No, Frugal polls usage data directly from provider APIs on a 5-minute cron schedule. There is no proxy layer, ensuring zero latency to your actual API requests."
  },
  {
    col: 2,
    question: "How are my API keys secured?",
    answer: "All API keys are encrypted using AES-256 before storage and are only decrypted server-side during the polling execution."
  },
  {
    col: 2,
    question: "Which AI providers do you support?",
    answer: "We support OpenAI, Anthropic, Replicate, fal.ai, Together AI, Mistral, Cohere, Groq, Perplexity, and ElevenLabs, with more providers being added regularly."
  },
  {
    col: 3,
    question: "What happens if I hit my budget limit?",
    answer: "Frugal sends automated alerts via email and Slack before your costs spiral, allowing you to take immediate action to pause or investigate usage."
  },
  {
    col: 3,
    question: "Do you offer a free trial?",
    answer: "Yes. Frugal's free plan monitors 1 provider indefinitely — no expiry, no credit card required. You can upgrade to Plus or Pro when you need more providers, projects, or Slack alerts."
  }
]

export default function OpenAILandingPage() {
  return (
    <div className="bg-background text-foreground relative z-0 min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1 relative overflow-hidden bg-background">
        {/* HERO */}
        <section className="relative px-6 pt-32 pb-24 md:px-8 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,80,11,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,80,11,0.12),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-5xl text-center relative z-10 animate-fade-in-up">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "https://getfrugal.dev" },
                  { name: "OpenAI Cost Monitoring" },
                ]}
              />
            </div>
            <h1 className="mb-6 font-serif text-4xl leading-tight font-medium text-foreground md:text-6xl lg:text-7xl tracking-tight">
              Stop Getting <span className="text-primary">Surprised</span> by Your OpenAI Bill
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
              Frugal connects directly to your OpenAI account and alerts you before costs spiral — no proxy, no code changes, up and running in 2&nbsp;minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_#FF500B59] w-full sm:w-auto"
              >
                Start Free — No Credit Card
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground text-base font-medium px-8 py-4 rounded-xl hover:bg-muted transition-colors w-full sm:w-auto"
              >
                View Pricing
              </Link>
            </div>
            <div className="mt-16 flex items-center justify-center gap-8">
              <span className="text-sm text-muted-foreground font-medium">OpenAI</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm text-muted-foreground font-medium">Anthropic</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm text-muted-foreground font-medium">Replicate</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm text-muted-foreground font-medium">fal.ai</span>
            </div>
          </div>
        </section>

        {/* PROBLEM & SOLUTION */}
        <section className="px-6 py-24 md:px-8 bg-muted/50 border-y border-border">
          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-serif text-3xl font-medium mb-4">The Problem</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  You gave your engineering team access to the OpenAI API to build incredible features, but now you have no idea how much they are spending until the end of the month. 
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Spreadsheets are outdated the moment you update them, and logging into the OpenAI dashboard constantly is a waste of time. Worse, a single runaway development loop or poorly optimized prompt can silently drain thousands of dollars overnight.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,80,11,0.1),transparent)] pointer-events-none" />
                <h2 className="font-serif text-3xl font-medium mb-4">The Solution</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Frugal provides a centralized dashboard to track your OpenAI API costs automatically. We poll your usage data every 5 minutes so you never get surprised by a massive bill again.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  It&apos;s the easiest way to give your team the AI access they need with the financial guardrails you demand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl font-medium mb-4">Everything you need to control spend</h2>
            </div>
            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
              <div className="glass-panel card-lift p-8 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-4 block">Core capability</span>
                <h3 className="text-xl font-semibold text-foreground leading-snug mb-3">Real-time Polling</h3>
                <p className="text-muted-foreground leading-relaxed">See your spend updated every 5 minutes — not just at the end of the month when it's too late to act.</p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="glass-panel card-lift p-6 rounded-2xl flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-snug mb-2">Budget Enforcement</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">Set hard caps that automatically trigger alerts when approaching limits.</p>
                </div>
                <div className="glass-panel card-lift p-6 rounded-2xl flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-snug mb-2">AES-256 Encryption</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">Your API keys are securely encrypted server-side. We never expose them.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="px-6 py-24 md:px-8 bg-muted/50 border-y border-border">
          <div className="mx-auto max-w-4xl text-center">
            <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-foreground italic mb-8">
              "Frugal caught a runaway dev loop before it hit $2,000. The Slack alert fired within minutes — we killed the process before it became an invoice."
            </blockquote>
            <p className="text-muted-foreground font-medium">— Early access user, AI startup</p>
            
            <div className="mt-16">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_#FF500B59]"
              >
                Start monitoring for free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl font-medium">How it works</h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-8">
              {[
                { num: "01", title: "Connect Your Account", desc: "Securely add your OpenAI API key. It's encrypted with AES-256 before storage and never appears in plaintext." },
                { num: "02", title: "Set Budget Rules", desc: "Define monthly financial limits for your entire team or specific projects. Choose to alert, throttle, or block." },
                { num: "03", title: "Get Alerts", desc: "Receive Slack and email notifications the moment you hit 80% of your budget — before costs spiral." }
              ].map(step => (
                <div key={step.num} className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold font-mono text-primary">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-snug mb-1.5">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="px-6 py-24 md:px-8 bg-muted/50 border-y border-border">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl font-medium">Frugal vs Alternatives</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-4 font-medium px-4">Feature</th>
                    <th className="py-4 font-semibold text-foreground px-4 bg-card rounded-t-xl border-x border-t border-border">Frugal</th>
                    <th className="py-4 font-medium px-4">Helicone</th>
                    <th className="py-4 font-medium px-4">Portkey</th>
                    <th className="py-4 font-medium px-4">LangSmith</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm md:text-base">
                  <tr>
                    <td className="py-4 px-4 font-medium">No proxy required</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Monitors 10+ providers</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">Partial</td>
                    <td className="py-4 px-4 text-muted-foreground">Partial</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Budget alerts</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Hard budget blocks</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                    <td className="py-4 px-4 text-muted-foreground">No</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Code change required</td>
                    <td className="py-4 px-4 bg-card border-x border-border rounded-b-xl border-b font-semibold text-primary">None</td>
                    <td className="py-4 px-4 text-muted-foreground">Proxy URL</td>
                    <td className="py-4 px-4 text-muted-foreground">Proxy URL</td>
                    <td className="py-4 px-4 text-muted-foreground">SDK wrap</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection customFaqs={faqs} />

        {/* FINAL CTA */}
        <section className="px-6 py-24 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,80,11,0.1),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-3xl text-center relative z-10">
            <h2 className="font-serif text-4xl font-medium mb-6">
              Don&apos;t wait for your next invoice to find out how much AI is costing you.
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_#FF500B59]"
              >
                Start Monitoring for Free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> Free forever plan</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> No credit card required</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> AES-256 encrypted keys</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
