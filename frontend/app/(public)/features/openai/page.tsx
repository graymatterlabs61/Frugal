import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { MarketingNav } from "@/components/landing/MarketingNav"
import { Footer } from "@/components/landing/Footer"
import { FaqSection } from "@/components/landing/FaqSection"

export const metadata: Metadata = {
  title: "The Ultimate OpenAI Spend Tracker for Engineering Teams",
  description: "Frugal connects directly to your OpenAI account to track spend in real-time, enforce budget limits, and alert you before unexpected bills occur.",
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
    answer: "We currently support OpenAI, Anthropic, Replicate, and fal.ai, with more providers being added regularly."
  },
  {
    col: 3,
    question: "What happens if I hit my budget limit?",
    answer: "Frugal sends automated alerts via email and Slack before your costs spiral, allowing you to take immediate action to pause or investigate usage."
  },
  {
    col: 3,
    question: "Do you offer a free trial?",
    answer: "Yes, we offer a 14-day free trial with full access to all tracking and alerting features, no credit card required."
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
          <div className="mx-auto max-w-5xl text-center relative z-10">
            <h1 className="mb-6 font-serif text-4xl leading-tight font-medium text-foreground md:text-6xl lg:text-7xl tracking-tight">
              The Ultimate OpenAI Spend Tracker for Engineering Teams
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
              Frugal is an AI API cost management platform that connects directly to your OpenAI account to track spend in real-time, enforce budget limits, and alert you before unexpected bills occur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_#FF500B59] w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground text-base font-medium px-8 py-4 rounded-xl hover:bg-muted transition-colors w-full sm:w-auto"
              >
                View Pricing
              </Link>
            </div>
            <div className="mt-16 flex items-center justify-center gap-8 opacity-60 grayscale">
              <span className="font-ethnocentric text-xl">OpenAI</span>
              <span className="font-ethnocentric text-xl">Anthropic</span>
              <span className="font-ethnocentric text-xl">Replicate</span>
              <span className="font-ethnocentric text-xl">fal.ai</span>
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
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Real-time Polling", desc: "See your spend updated every 5 minutes, not just at the end of the month." },
                { title: "Budget Enforcement", desc: "Set hard caps that automatically trigger alerts when approaching limits." },
                { title: "AES-256 Encryption", desc: "Your API keys are securely encrypted server-side. We never expose them." }
              ].map(f => (
                <div key={f.title} className="p-8 rounded-2xl border border-border bg-card">
                  <h3 className="font-heading text-xl font-semibold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="px-6 py-24 md:px-8 bg-muted/50 border-y border-border">
          <div className="mx-auto max-w-4xl text-center">
            <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-foreground italic mb-8">
              "Frugal saved us from a $2,000 runaway loop in our dev environment. The Slack alert fired the minute the loop started, allowing us to kill the process instantly."
            </blockquote>
            <p className="text-muted-foreground font-medium">— Startup Founder</p>
            
            <div className="mt-16">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-base font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_#FF500B59]"
              >
                Stop guessing your OpenAI costs. Get Started.
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
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Connect Your Account", desc: "Securely add your OpenAI API key (encrypted with AES-256)." },
                { num: "02", title: "Set Budget Rules", desc: "Define monthly financial limits for your entire team or specific projects." },
                { num: "03", title: "Get Alerts", desc: "Receive Slack and email notifications the exact moment you hit 80% of your budget." }
              ].map(step => (
                <div key={step.num} className="relative">
                  <div className="text-6xl font-ethnocentric text-primary/10 mb-4">{step.num}</div>
                  <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
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
                    <th className="py-4 font-medium px-4">DIY Scripts</th>
                    <th className="py-4 font-medium px-4">Enterprise Platforms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm md:text-base">
                  <tr>
                    <td className="py-4 px-4 font-medium">Setup Time</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">5 minutes</td>
                    <td className="py-4 px-4 text-muted-foreground">Days of engineering</td>
                    <td className="py-4 px-4 text-muted-foreground">Weeks of onboarding</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Cost</td>
                    <td className="py-4 px-4 bg-card border-x border-border font-semibold text-primary">Accessible SaaS</td>
                    <td className="py-4 px-4 text-muted-foreground">"Free" (Costs dev time)</td>
                    <td className="py-4 px-4 text-muted-foreground">$1,000+/mo</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Custom BI Integrations</td>
                    <td className="py-4 px-4 bg-card border-x border-border rounded-b-xl border-b font-semibold text-primary">No</td>
                    <td className="py-4 px-4 text-muted-foreground">Yes</td>
                    <td className="py-4 px-4 text-muted-foreground">Yes</td>
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
                Start Your Free Trial Today
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> Built on Supabase</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> Secured with AES-256</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-primary"/> Deployed on Vercel</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
