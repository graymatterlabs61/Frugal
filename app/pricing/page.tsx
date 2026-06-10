"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { Check, ChevronDown, Building2, Users, ArrowRight, Shield } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PERSONAL_PLANS = [
  {
    id: "free",
    name: "Free",
    badge: "FREE",
    badgeClass: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    tagline: "For solo devs and side projects",
    monthly: 0,
    yearly: 0,
    yearlyTotal: 0,
    saving: 0,
    featured: false,
    cta: "Get started free",
    ctaHref: "/signup",
    features: [
      "1 API connection",
      "1 project",
      "7-day usage history",
      "5-min polling",
      "Email alerts",
      "Multi-provider dashboard",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    badge: "POPULAR",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "For growing products with real budgets",
    monthly: 19,
    yearly: 15,
    yearlyTotal: 180,
    saving: 48,
    featured: true,
    cta: "Start with Plus",
    ctaHref: "/signup?plan=plus",
    features: [
      "3 API connections",
      "5 projects",
      "90-day usage history",
      "5-min polling",
      "Email + Slack alerts",
      "Budget rules (alert + block)",
      "Burn rate dashboard",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "PRO",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    tagline: "Unlimited everything, API access",
    monthly: 49,
    yearly: 39,
    yearlyTotal: 468,
    saving: 120,
    featured: false,
    cta: "Start with Pro",
    ctaHref: "/signup?plan=pro",
    features: [
      "Unlimited connections",
      "Unlimited projects",
      "1-year usage history",
      "5-min polling",
      "Email + Slack + Webhook",
      "All budget rule types",
      "Per-user attribution (v1.1)",
      "Programmatic API",
    ],
  },
] as const;

const CORPORATE_PLANS = [
  {
    id: "team",
    name: "Team",
    badge: "2–10 SEATS",
    badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    tagline: "Proxy gateway for small engineering teams",
    price: "$79",
    priceSub: "/month flat",
    yearlyNote: "~$63/mo billed annually",
    featured: false,
    features: [
      "Proxy gateway (no code change)",
      "Real-time request blocking",
      "Per-employee cost attribution",
      "Admin dashboard",
      "All AI providers supported",
      "Email + Slack alerts",
      "Community support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    badge: "11–20 SEATS",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "SSO, compliance exports, priority support",
    price: "$149",
    priceSub: "/month flat",
    yearlyNote: "~$119/mo billed annually",
    featured: true,
    features: [
      "Everything in Team",
      "Single sign-on (SSO)",
      "Compliance & audit export",
      "Per-team budget policies",
      "Priority email · 24h support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    badge: "20+ SEATS",
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    tagline: "Enterprise SLA for large organisations",
    price: "Custom",
    priceSub: "contact sales",
    yearlyNote: "Custom contract available",
    featured: false,
    features: [
      "Everything in Scale",
      "99.9% uptime SLA",
      "Dedicated onboarding",
      "Custom contract",
      "Slack-based support channel",
    ],
  },
] as const;

const FAQS = [
  {
    q: "What is the difference between Personal and Corporate plans?",
    a: "Personal plans use polling — Frugal reads your provider usage APIs every 5 minutes. No proxy, no code change, zero integration friction. Corporate plans route your team's requests through a Frugal proxy gateway, enabling real-time per-employee attribution and sub-second blocking. Corporate is on the waitlist, targeting Q3 2026.",
  },
  {
    q: "Does Frugal ever proxy my API requests on the Personal plan?",
    a: "No. On Personal plans, your requests go directly from your application to the AI provider. Frugal only reads your usage and billing data via each provider's reporting API. We never see your prompts or completions.",
  },
  {
    q: "Is my API key secure?",
    a: "Yes. Your key is AES-256 encrypted immediately on receipt and stored only in encrypted form. It is used exclusively to call your provider's usage/reporting endpoint — never to make model requests. The last 4 characters are shown in the UI; the full key is never returned after save.",
  },
  {
    q: "What does 5-minute polling mean in practice?",
    a: "Frugal fetches your latest spend from each connected provider every 5 minutes. Budget rules fire at the next poll cycle after a threshold is crossed. For most developers this is more than fast enough — use your provider's native hard limits as the immediate floor, and Frugal as the early-warning and automated response layer above.",
  },
  {
    q: "What is the difference between Alert, Block, and Throttle actions?",
    a: "Alert: sends an email (and Slack on Plus+) when your spend crosses the threshold. Block: flags the connection in Frugal and escalates alerts at the next poll cycle — important: because Frugal never sits between your app and the provider on Personal plans, it cannot stop requests your app is already making. Pair Block with your provider's native hard limit for a true stop. Throttle (Pro) follows the same model with a softer escalation. Real request-level blocking arrives with the Corporate proxy plan.",
  },
  {
    q: "What is the difference between Plus and Pro?",
    a: "Plus gives you 3 connections, 5 projects, 90-day history, Slack alerts, and budget rules (alert + block). Pro adds unlimited connections and projects, 1-year history, webhook alerts, and programmatic API access. Per-user cost attribution (track which of your end-users costs what) is a Pro feature arriving in v1.1 with a lightweight SDK.",
  },
  {
    q: "Do I need to change any code to use Frugal?",
    a: "No. On Personal plans, connect your API key in the dashboard and Frugal starts polling immediately. Your application code, base URLs, and model calls are completely unchanged.",
  },
  {
    q: "Can I cancel or change plans at any time?",
    a: "Yes. You can upgrade, downgrade, or cancel from the billing settings at any time. Cancellations take effect at the end of the current billing period — you keep access until then.",
  },
  {
    q: "When does the Corporate plan launch?",
    a: "Corporate is targeting Q3 2026. The waitlist is open — join to get early access and founding-customer pricing. We will not launch corporate until the personal plan is proven and our security posture (targeting SOC 2 Type II in Q4 2026) meets the bar enterprises expect.",
  },
  {
    q: "What AI providers does Frugal support?",
    a: "Currently: OpenAI, Anthropic, Replicate, and fal.ai. More providers are on the roadmap. If your provider exposes a usage or billing API, we can add it.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Tab = "personal" | "corporate";
type Interval = "monthly" | "yearly";

function IntervalToggle({
  value,
  onChange,
}: {
  value: Interval;
  onChange: (v: Interval) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/[0.08]">
      {(["monthly", "yearly"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${value === v
              ? "bg-white/[0.12] text-foreground border border-white/[0.12] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {v}
          {v === "yearly" && (
            <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">−2 mo</span>
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({
  featured,
  children,
}: {
  featured: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={
        featured
          ? {
            background:
              "linear-gradient(145deg, oklch(0.97 0 0 / 0.95) 0%, oklch(0.92 0 0 / 0.9) 100%)",
            border: "1px solid oklch(1 0 0 / 0.3)",
          }
          : {
            background:
              "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
            border: "1px solid oklch(1 0 0 / 0.10)",
          }
      }
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordion FAQ
// ---------------------------------------------------------------------------

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(1 0 0 / 0.08)", background: "oklch(1 0 0 / 0.03)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-white/[0.06] pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner page (needs useSearchParams)
// ---------------------------------------------------------------------------

function PricingPageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "corporate" ? "corporate" : "personal"
  );
  const [personalInterval, setPersonalInterval] = useState<Interval>("yearly");
  const [corporateInterval, setCorporateInterval] = useState<Interval>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function toggleFaq(i: number) {
    setOpenFaq((prev) => (prev === i ? null : i));
  }

  return (
    <>
      <MarketingNav />

      <main className="min-h-screen">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="pt-24 pb-12 px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Pick the plan that fits<br className="hidden md:block" /> your build
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, no credit card needed. Personal plans connect your API keys with zero code change.
            Corporate proxy gateway coming Q3 2026.
          </p>
        </section>

        {/* ── Personal / Corporate tab toggle ───────────────────────────── */}
        <div className="flex justify-center px-4 mb-10">
          <div
            className="inline-flex items-center gap-1 p-1 rounded-2xl"
            style={{
              background: "oklch(1 0 0 / 0.05)",
              border: "1px solid oklch(1 0 0 / 0.10)",
            }}
          >
            <button
              onClick={() => setTab("personal")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "personal"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Personal
              <span className="text-[10px] font-mono opacity-70">dev</span>
            </button>
            <button
              onClick={() => setTab("corporate")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "corporate"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Corporate
              <span className="text-[10px] font-mono text-yellow-400 font-bold">waitlist</span>
            </button>
          </div>
        </div>

        {/* ── Personal Plans ────────────────────────────────────────────── */}
        {tab === "personal" && (
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">Personal Plans</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  No proxy. No code change. Connect in 2 minutes.
                </p>
              </div>
              <IntervalToggle value={personalInterval} onChange={setPersonalInterval} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {PERSONAL_PLANS.map((p) => {
                const price = personalInterval === "yearly" && p.yearly > 0 ? p.yearly : p.monthly;
                return (
                  <PlanCard key={p.id} featured={p.featured}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-bold text-base ${p.featured ? "text-background" : ""}`}>
                        {p.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${p.featured ? "text-background/70 bg-black/10 border-black/20" : p.badgeClass
                          }`}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold font-mono ${p.featured ? "text-background" : ""}`}>
                          {price === 0 ? "$0" : `$${price}`}
                        </span>
                        <span className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>
                          {price === 0 ? "/ forever" : "/month"}
                        </span>
                      </div>
                      {personalInterval === "yearly" && p.saving > 0 && (
                        <p className={`text-xs mt-0.5 ${p.featured ? "text-background/60" : "text-emerald-400"}`}>
                          Save ${p.saving}/yr · ${p.yearlyTotal}/yr total
                        </p>
                      )}
                      {personalInterval === "monthly" && p.yearly > 0 && (
                        <p className={`text-xs mt-0.5 ${p.featured ? "text-background/50" : "text-muted-foreground/60"}`}>
                          ${p.yearly}/mo on yearly
                        </p>
                      )}
                    </div>

                    <Link
                      href={p.ctaHref}
                      className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 flex items-center justify-center transition-all ${p.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                        }`}
                    >
                      {p.cta}
                    </Link>

                    <ul className="space-y-2 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className={`flex items-start gap-2 text-sm ${p.featured ? "text-background/80" : ""}`}>
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.featured ? "text-background/60" : "text-primary"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </PlanCard>
                );
              })}
            </div>

            {/* Annual discount note */}
            {personalInterval === "monthly" && (
              <p className="text-center text-sm text-muted-foreground mt-5">
                Switch to yearly and save up to $120/yr.{" "}
                <button onClick={() => setPersonalInterval("yearly")} className="text-primary underline underline-offset-2">
                  Switch to yearly
                </button>
              </p>
            )}

            {/* Corporate upsell */}
            <div
              className="mt-8 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
              style={{
                background: "oklch(1 0 0 / 0.03)",
                border: "1px dashed oklch(1 0 0 / 0.14)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.10)" }}>
                <Building2 className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="font-semibold text-sm">Need corporate-grade control?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proxy gateway with real-time blocking, per-employee attribution, SSO, and compliance exports. Waitlist open — targeting Q3 2026.
                </p>
              </div>
              <button
                onClick={() => setTab("corporate")}
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View Corporate <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── Corporate Plans ───────────────────────────────────────────── */}
        {tab === "corporate" && (
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Corporate Plans</h2>
                  <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border text-yellow-400 bg-yellow-500/10 border-yellow-500/30">
                    Waitlist Open
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Proxy gateway — requests route through Frugal for real-time attribution and blocking.
                </p>
              </div>
              <IntervalToggle value={corporateInterval} onChange={setCorporateInterval} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {CORPORATE_PLANS.map((p) => (
                <PlanCard key={p.id} featured={p.featured}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-base ${p.featured ? "text-background" : ""}`}>
                      {p.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${p.featured ? "text-background/70 bg-black/10 border-black/20" : p.badgeClass
                        }`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold font-mono ${p.featured ? "text-background" : ""}`}>
                        {p.price}
                      </span>
                      <span className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>
                        {p.priceSub}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${p.featured ? "text-background/60" : "text-muted-foreground/70"}`}>
                      {corporateInterval === "yearly" ? p.yearlyNote : p.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = "mailto:founder@frugal.dev?subject=Corporate%20Plan%20Waitlist";
                      }
                    }}
                    className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 flex items-center justify-center gap-1.5 transition-all ${p.featured
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Join Waitlist
                  </button>

                  <ul className="space-y-2 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${p.featured ? "text-background/80" : ""}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.featured ? "text-background/60" : "text-primary"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </PlanCard>
              ))}
            </div>

            {/* Trust note */}
            <div
              className="mt-6 rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "oklch(1 0 0 / 0.02)", border: "1px dashed oklch(1 0 0 / 0.10)" }}
            >
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Corporate proxy routes requests through Frugal for attribution — we never store prompt or completion content.
                SOC 2 Type II targeted Q4 2026. Architecture review available on request:{" "}
                <a href="mailto:founder@frugal.dev" className="text-foreground font-medium hover:underline">
                  founder@frugal.dev
                </a>
              </p>
            </div>

            {/* Personal upsell */}
            <div
              className="mt-4 rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)" }}
            >
              <p className="text-sm text-muted-foreground flex-1">
                Want to start today without waiting? Personal plans are live now — no proxy, no code change.
              </p>
              <button
                onClick={() => setTab("personal")}
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View Personal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── Feature comparison row ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold mb-6 text-center">Compare plans at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
                  <th className="text-left py-3 pr-4 text-muted-foreground font-medium w-1/3">Feature</th>
                  <th className="text-center py-3 px-2 font-semibold">Free</th>
                  <th className="text-center py-3 px-2 font-semibold text-primary">Plus</th>
                  <th className="text-center py-3 px-2 font-semibold">Pro</th>
                  <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Corporate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["API connections", "1", "3", "Unlimited", "Unlimited"],
                  ["Projects", "1", "5", "Unlimited", "Unlimited"],
                  ["Usage history", "7 days", "90 days", "1 year", "90 days+"],
                  ["Poll interval", "5 min", "5 min", "5 min", "Real-time"],
                  ["Email alerts", "✓", "✓", "✓", "✓"],
                  ["Slack alerts", "—", "✓", "✓", "✓"],
                  ["Webhook alerts", "—", "—", "✓", "✓"],
                  ["Budget rules (alert)", "—", "✓", "✓", "✓"],
                  ["Budget rules (block)", "—", "✓", "✓", "Real-time"],
                  ["Budget rules (throttle)", "—", "—", "✓", "✓"],
                  ["Per-user attribution", "—", "—", "v1.1", "✓"],
                  ["Per-employee attribution", "—", "—", "—", "✓"],
                  ["SSO", "—", "—", "—", "Scale+"],
                  ["Compliance export", "—", "—", "—", "Scale+"],
                  ["Programmatic API", "—", "—", "✓", "✓"],
                  ["Support", "Community", "Email 48h", "Priority 24h", "Priority 24h+"],
                ].map(([feature, free, plus, pro, corp]) => (
                  <tr key={feature} className="border-b" style={{ borderColor: "oklch(1 0 0 / 0.05)" }}>
                    <td className="py-2.5 pr-4 text-muted-foreground">{feature}</td>
                    <td className="py-2.5 px-2 text-center">{free === "✓" ? <Check className="w-3.5 h-3.5 text-muted-foreground mx-auto" /> : <span className={free === "—" ? "text-muted-foreground/30" : ""}>{free}</span>}</td>
                    <td className="py-2.5 px-2 text-center">{plus === "✓" ? <Check className="w-3.5 h-3.5 text-primary mx-auto" /> : <span className={plus === "—" ? "text-muted-foreground/30" : "text-primary font-medium"}>{plus}</span>}</td>
                    <td className="py-2.5 px-2 text-center">{pro === "✓" ? <Check className="w-3.5 h-3.5 text-foreground mx-auto" /> : <span className={pro === "—" ? "text-muted-foreground/30" : ""}>{pro}</span>}</td>
                    <td className="py-2.5 px-2 text-center text-muted-foreground">{corp === "✓" ? <Check className="w-3.5 h-3.5 mx-auto" /> : <span className={corp === "—" ? "text-muted-foreground/30" : ""}>{corp}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <h2 className="text-xl font-bold mb-2 text-center">Frequently asked questions</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Still have questions?{" "}
            <a href="mailto:founder@frugal.dev" className="text-primary hover:underline underline-offset-2">
              Email us
            </a>
          </p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
          <div
            className="rounded-2xl p-10"
            style={{
              background: "linear-gradient(145deg, oklch(1 0 0 / 0.07) 0%, oklch(1 0 0 / 0.03) 100%)",
              border: "1px solid oklch(1 0 0 / 0.10)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Start monitoring for free</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-7 max-w-lg mx-auto">
              Connect your first API key in under 2 minutes. No credit card, no code change, no proxy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:founder@frugal.dev"
                className="inline-flex items-center gap-2 border border-white/[0.10] text-foreground hover:bg-white/[0.05] font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Talk to us
              </a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Free forever · No credit card · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// ---------------------------------------------------------------------------
// Export — Suspense boundary for useSearchParams
// ---------------------------------------------------------------------------

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageInner />
    </Suspense>
  );
}
