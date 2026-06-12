"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { Check, ChevronDown, Building2, Users, ArrowRight, Shield } from "lucide-react";
import { MagicCard } from "@/components/ui/magic/magic-card";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import type { PersonalPlan, CorporatePlan, Faq } from "@/lib/queries/public";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "personal" | "corporate";
type Interval = "monthly" | "yearly";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
            value === v
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
  if (featured) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, oklch(0.97 0 0 / 0.95) 0%, oklch(0.92 0 0 / 0.9) 100%)",
        }}
      >
        <ShineBorder
          shineColor={["#FF500B", "#ff8c5a", "#ffffff"]}
          borderWidth={2}
          duration={8}
        />
        {children}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid oklch(1 0 0 / 0.10)" }} className="rounded-2xl">
      <MagicCard
        mode="orb"
        className="rounded-2xl p-5 flex flex-col cursor-default"
        glowFrom="#6366f1"
        glowTo="#8b5cf6"
        glowSize={120}
        glowBlur={40}
        glowOpacity={0.2}
      >
        {children}
      </MagicCard>
    </div>
  );
}

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
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
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
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
// Inner page (needs useSearchParams + state)
// ---------------------------------------------------------------------------

function PricingPageInner({
  personalPlans,
  corporatePlans,
  faqs,
}: {
  personalPlans: PersonalPlan[];
  corporatePlans: CorporatePlan[];
  faqs: Faq[];
}) {
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
            Pick the plan that fits<br className="hidden md:block" /> your team
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            For individual developers who fear surprise bills, and for companies managing AI spend
            across their whole team. Start free — no credit card, no code change.
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "personal"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personal
              <span className="text-[10px] font-mono opacity-70">dev</span>
            </button>
            <button
              onClick={() => setTab("corporate")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "corporate"
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
                <h2 className="text-lg font-semibold">
                  For developers and engineering managers
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  No proxy. No code change. Connect in 2 minutes.
                </p>
              </div>
              <IntervalToggle value={personalInterval} onChange={setPersonalInterval} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {personalPlans.map((p) => {
                const price =
                  personalInterval === "yearly" && p.yearlyPrice > 0
                    ? p.yearlyPrice
                    : p.monthlyPrice;
                return (
                  <PlanCard key={p.id} featured={p.featured}>
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`font-bold text-base ${p.featured ? "text-background" : ""}`}
                      >
                        {p.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${
                          p.featured
                            ? "text-background/70 bg-black/10 border-black/20"
                            : p.badgeClass
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl font-bold font-mono ${
                            p.featured ? "text-background" : ""
                          }`}
                        >
                          {price === 0 ? "$0" : `$${price}`}
                        </span>
                        <span
                          className={`text-sm ${
                            p.featured ? "text-background/60" : "text-muted-foreground"
                          }`}
                        >
                          {price === 0 ? "/ forever" : "/month"}
                        </span>
                      </div>
                      {personalInterval === "yearly" && p.yearlySaving > 0 && (
                        <p
                          className={`text-xs mt-0.5 ${
                            p.featured ? "text-background/60" : "text-emerald-400"
                          }`}
                        >
                          Save ${p.yearlySaving}/yr · ${p.yearlyTotal}/yr total
                        </p>
                      )}
                      {personalInterval === "monthly" && p.yearlyPrice > 0 && (
                        <p
                          className={`text-xs mt-0.5 ${
                            p.featured ? "text-background/50" : "text-muted-foreground/60"
                          }`}
                        >
                          ${p.yearlyPrice}/mo on yearly
                        </p>
                      )}
                    </div>

                    <Link
                      href={p.ctaHref}
                      className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 flex items-center justify-center transition-all ${
                        p.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                      }`}
                    >
                      {p.ctaLabel}
                    </Link>

                    <ul className="space-y-2 flex-1">
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className={`flex items-start gap-2 text-sm ${
                            p.featured ? "text-background/80" : ""
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              p.featured ? "text-background/60" : "text-primary"
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </PlanCard>
                );
              })}
            </div>

            {personalInterval === "monthly" && (
              <p className="text-center text-sm text-muted-foreground mt-5">
                Switch to yearly and save up to $120/yr.{" "}
                <button
                  onClick={() => setPersonalInterval("yearly")}
                  className="text-primary underline underline-offset-2"
                >
                  Switch to yearly
                </button>
              </p>
            )}

            <div
              className="mt-8 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
              style={{
                background: "oklch(1 0 0 / 0.03)",
                border: "1px dashed oklch(1 0 0 / 0.14)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "oklch(1 0 0 / 0.06)",
                  border: "1px solid oklch(1 0 0 / 0.10)",
                }}
              >
                <Building2 className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="font-semibold text-sm">Managing AI spend across your team?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Team and Scale plans add per-user attribution, org-wide budget governance, SSO,
                  and compliance exports. Waitlist open — targeting Q3 2026.
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
                  <h2 className="text-lg font-semibold">
                    For teams and companies managing AI spend
                  </h2>
                  <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border text-yellow-400 bg-yellow-500/10 border-yellow-500/30">
                    Waitlist Open
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Per-user attribution, org-wide budget governance, and admin controls — launching
                  Q3 2026.
                </p>
              </div>
              <IntervalToggle value={corporateInterval} onChange={setCorporateInterval} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {corporatePlans.map((p) => (
                <PlanCard key={p.id} featured={p.featured}>
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`font-bold text-base ${p.featured ? "text-background" : ""}`}
                    >
                      {p.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${
                        p.featured
                          ? "text-background/70 bg-black/10 border-black/20"
                          : p.badgeClass
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-bold font-mono ${
                          p.featured ? "text-background" : ""
                        }`}
                      >
                        {p.price}
                      </span>
                      <span
                        className={`text-sm ${
                          p.featured ? "text-background/60" : "text-muted-foreground"
                        }`}
                      >
                        {p.priceSub}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        p.featured ? "text-background/60" : "text-muted-foreground/70"
                      }`}
                    >
                      {corporateInterval === "yearly" ? p.yearlyNote : p.tagline}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${p.featured ? "text-background/50" : "text-muted-foreground/50"}`}>
                      {p.seats}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = p.id === "enterprise"
                          ? "mailto:founder@getfrugal.dev?subject=Enterprise%20Inquiry"
                          : "mailto:founder@getfrugal.dev?subject=Corporate%20Plan%20Waitlist";
                      }
                    }}
                    className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 flex items-center justify-center gap-1.5 transition-all ${
                      p.featured
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {p.ctaLabel}
                  </button>

                  <ul className="space-y-2 flex-1">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2 text-sm ${
                          p.featured ? "text-background/80" : ""
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            p.featured ? "text-background/60" : "text-primary"
                          }`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </PlanCard>
              ))}
            </div>

            <div
              className="mt-6 rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "oklch(1 0 0 / 0.02)", border: "1px dashed oklch(1 0 0 / 0.10)" }}
            >
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Corporate proxy routes requests through Frugal for attribution — we never store
                  prompt or completion content. SOC 2 Type II targeted Q4 2026. Architecture review
                  available on request:{" "}
                  <a
                    href="mailto:founder@getfrugal.dev"
                    className="text-foreground font-medium hover:underline"
                  >
                    founder@getfrugal.dev
                  </a>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  We take encryption seriously. You can{" "}
                  <Link href="/about" className="text-foreground font-medium hover:underline">
                    read about our security posture
                  </Link>{" "}
                  and how we handle API keys on our about page.
                </p>
              </div>
            </div>

            <div
              className="mt-4 rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)" }}
            >
              <p className="text-sm text-muted-foreground flex-1">
                Want to start today without waiting? Personal plans are live now — no proxy, no
                code change.
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

        {/* ── Feature comparison table ───────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold mb-6 text-center">Compare plans at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
                  <th className="text-left py-3 pr-4 text-muted-foreground font-medium w-1/3">
                    Feature
                  </th>
                  <th className="text-center py-3 px-2 font-semibold">Free</th>
                  <th className="text-center py-3 px-2 font-semibold text-primary">Plus</th>
                  <th className="text-center py-3 px-2 font-semibold">Pro</th>
                  <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                    Corporate
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["API connections", "1", "3", "Unlimited", "25 → ∞"],
                    ["Projects", "1", "5", "Unlimited", "50 → ∞"],
                    ["Usage history", "7 days", "90 days", "1 year", "1 year"],
                    ["SDK events/month", "50K", "1M", "Unlimited", "10M → ∞"],
                    ["Email alerts", "✓", "✓", "✓", "✓"],
                    ["Slack alerts", "—", "✓", "✓", "✓"],
                    ["Webhook alerts", "—", "—", "✓", "✓"],
                    ["Burn rate forecast", "—", "✓", "✓", "✓"],
                    ["Budget guardrail: Alert", "—", "✓", "✓", "✓"],
                    ["Budget guardrail: Block", "—", "✓", "✓", "✓"],
                    ["Budget guardrail: Throttle", "—", "—", "—", "✓ real-time"],
                    ["Per-user attribution", "—", "—", "✓", "✓"],
                    ["Team budget governance", "—", "—", "—", "✓"],
                    ["Programmatic API", "—", "—", "✓", "✓"],
                    ["SSO", "—", "—", "—", "Scale +"],
                    ["Audit & compliance export", "—", "—", "—", "Scale +"],
                    ["Support", "Community", "Email 48h", "Priority 24h", "Priority → Dedicated"],
                  ] as [string, string, string, string, string][]
                ).map(([feature, free, plus, pro, team]) => (
                  <tr key={feature} className="border-b" style={{ borderColor: "oklch(1 0 0 / 0.05)" }}>
                    <td className="py-2.5 pr-4 text-muted-foreground">{feature}</td>
                    <td className="py-2.5 px-2 text-center">
                      {free === "✓" ? (
                        <Check className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className={free === "—" ? "text-muted-foreground/30" : ""}>{free}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {plus === "✓" ? (
                        <Check className="w-3.5 h-3.5 text-primary mx-auto" />
                      ) : (
                        <span className={plus === "—" ? "text-muted-foreground/30" : "text-primary font-medium"}>
                          {plus}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {pro === "✓" ? (
                        <Check className="w-3.5 h-3.5 text-foreground mx-auto" />
                      ) : (
                        <span className={pro === "—" ? "text-muted-foreground/30" : ""}>{pro}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center text-muted-foreground">
                      {team === "✓" ? (
                        <Check className="w-3.5 h-3.5 mx-auto" />
                      ) : (
                        <span className={team === "—" ? "text-muted-foreground/30" : ""}>{team}</span>
                      )}
                    </td>
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
            Still have questions? Feel free to{" "}
            <Link href="/contact" className="text-primary hover:underline underline-offset-2">
              contact our support team
            </Link>{" "}
            and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
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
              background:
                "linear-gradient(145deg, oklch(1 0 0 / 0.07) 0%, oklch(1 0 0 / 0.03) 100%)",
              border: "1px solid oklch(1 0 0 / 0.10)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Start monitoring for free</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-7 max-w-lg mx-auto">
              Connect your first API key in under 2 minutes. No credit card, no code change, no
              proxy.
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
                href="mailto:founder@getfrugal.dev"
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

export function PricingPageClient({
  personalPlans,
  corporatePlans,
  faqs,
}: {
  personalPlans: PersonalPlan[];
  corporatePlans: CorporatePlan[];
  faqs: Faq[];
}) {
  return (
    <Suspense fallback={null}>
      <PricingPageInner
        personalPlans={personalPlans}
        corporatePlans={corporatePlans}
        faqs={faqs}
      />
    </Suspense>
  );
}
