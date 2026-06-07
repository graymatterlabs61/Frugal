"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Building2, Download, Users } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StripeInvoice {
  id: string;
  amount_paid: number; // cents
  status: string; // 'paid' | 'open' | 'void'
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created: number; // Unix timestamp
  period_start: number;
  period_end: number;
  currency: string;
}

interface BillingClientProps {
  currentPlan: "free" | "starter" | "pro"; // DB value
  hasStripeCustomer: boolean;
  invoices: StripeInvoice[];
  priceIds: {
    starterMonthly: string;
    starterYearly: string;
    proMonthly: string;
    proYearly: string;
  };
}

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

const PERSONAL_PLANS = [
  {
    id: "free",
    name: "Free",
    badge: "FREE",
    badgeClass: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    tagline: "For solo devs and side projects",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    saving: 0,
    featured: false,
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
    annual: 15,
    annualTotal: 180,
    saving: 48,
    featured: true,
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
    tagline: "Per-user attribution, unlimited everything",
    monthly: 49,
    annual: 39,
    annualTotal: 468,
    saving: 120,
    featured: false,
    features: [
      "Unlimited connections",
      "Unlimited projects",
      "1-year usage history",
      "5-min polling",
      "Email + Slack + Webhook",
      "All budget rule types",
      "Per-user attribution",
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
    priceNote: "/month flat",
    featured: false,
    features: [
      "Proxy gateway (no URL change)",
      "Real-time request blocking",
      "Per-employee attribution",
      "Admin dashboard",
      "5-min poll + request-level data",
      "Email + Slack alerts",
      "Community support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    badge: "11–20 SEATS",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "SSO, compliance, and audit-ready exports",
    price: "$149",
    priceNote: "/month flat",
    featured: true,
    features: [
      "Everything in Team",
      "Single sign-on (SSO)",
      "Compliance export",
      "Per-team budget policies",
      "Priority email · 24h support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    badge: "20+ SEATS",
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    tagline: "Enterprise-grade SLA for large orgs",
    price: "Custom",
    priceNote: "contact sales",
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

type Interval = "monthly" | "yearly";
type LoadingPlan = null | "plus" | "pro";

function formatDate(unix: number): string {
  return new Date(unix * 1000).toISOString().split("T")[0];
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function getStatusClass(status: string): string {
  if (status === "paid") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (status === "open") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  return "text-muted-foreground bg-white/5 border-white/10";
}

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams — must be wrapped in Suspense)
// ---------------------------------------------------------------------------

function BillingClientInner({
  currentPlan,
  hasStripeCustomer,
  invoices,
  priceIds,
}: BillingClientProps) {
  const searchParams = useSearchParams();
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState<LoadingPlan>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Plan upgraded successfully!");
    }
  }, [searchParams]);

  function isCurrent(planId: string): boolean {
    if (planId === "free" && currentPlan === "free") return true;
    if (planId === "plus" && currentPlan === "starter") return true;
    if (planId === "pro" && currentPlan === "pro") return true;
    return false;
  }

  async function handleUpgrade(planId: "plus" | "pro") {
    setLoading(planId);
    try {
      const priceId =
        planId === "plus"
          ? interval === "monthly"
            ? priceIds.starterMonthly
            : priceIds.starterYearly
          : interval === "monthly"
          ? priceIds.proMonthly
          : priceIds.proYearly;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url!;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url!;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Portal unavailable");
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Personal Plans ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-base">Personal Plans</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect your API keys. No proxy, no code change. See unified spend in 2 minutes.
            </p>
          </div>
          <div
            className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{
              background: "oklch(1 0 0 / 0.05)",
              border: "1px solid oklch(1 0 0 / 0.08)",
            }}
          >
            {(["monthly", "yearly"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setInterval(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  interval === v
                    ? "bg-white/[0.1] text-foreground shadow-sm border border-white/[0.1]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
                {v === "yearly" && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">−2mo</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PERSONAL_PLANS.map((p) => {
            const current = isCurrent(p.id);
            const price = interval === "yearly" && p.annual > 0 ? p.annual : p.monthly;
            const cta = current ? "Current Plan" : "Upgrade Plan";

            return (
              <div
                key={p.id}
                className="rounded-2xl p-5 flex flex-col"
                style={
                  p.featured
                    ? {
                        background:
                          "linear-gradient(145deg, oklch(0.97 0 0 / 0.95) 0%, oklch(0.92 0 0 / 0.9) 100%)",
                        border: "1px solid oklch(1 0 0 / 0.3)",
                      }
                    : glassCard
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-bold text-base ${p.featured ? "text-background" : ""}`}>
                    {p.name}
                  </h4>
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
                      className={`text-3xl font-bold font-mono ${p.featured ? "text-background" : ""}`}
                    >
                      {price === 0 ? "$0" : `$${price}`}
                    </span>
                    <span
                      className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {price === 0 ? "/ forever" : "/month"}
                    </span>
                  </div>
                  {interval === "yearly" && p.saving > 0 && (
                    <p
                      className={`text-xs mt-0.5 ${p.featured ? "text-background/60" : "text-emerald-400"}`}
                    >
                      Save ${p.saving}/yr · ${p.annualTotal}/yr total
                    </p>
                  )}
                </div>

                <Button
                  disabled={current || loading === p.id}
                  onClick={() => {
                    if (!current && (p.id === "plus" || p.id === "pro")) {
                      void handleUpgrade(p.id);
                    }
                  }}
                  className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 ${
                    p.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : current
                      ? "bg-white/5 text-muted-foreground border border-white/[0.08] cursor-default"
                      : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                  }`}
                >
                  {loading === p.id ? "Loading..." : cta}
                </Button>

                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${p.featured ? "text-background/80" : ""}`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.featured ? "text-background/60" : "text-primary"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {hasStripeCustomer && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="rounded-xl border-white/[0.1] h-9 px-4 text-sm"
              onClick={() => void handlePortal()}
              disabled={portalLoading}
            >
              {portalLoading ? "Loading..." : "Manage Plan / Cancel"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Corporate Plans ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">Corporate Plans</h3>
              <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border text-yellow-400 bg-yellow-500/10 border-yellow-500/30">
                Waitlist Open
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Proxy gateway with real-time blocking and per-employee attribution. Targeting Q3 2026.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {CORPORATE_PLANS.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-5 flex flex-col"
              style={
                p.featured
                  ? {
                      background:
                        "linear-gradient(145deg, oklch(0.97 0 0 / 0.95) 0%, oklch(0.92 0 0 / 0.9) 100%)",
                      border: "1px solid oklch(1 0 0 / 0.3)",
                    }
                  : glassCard
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-bold text-base ${p.featured ? "text-background" : ""}`}>
                  {p.name}
                </h4>
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
                    className={`text-3xl font-bold font-mono ${p.featured ? "text-background" : ""}`}
                  >
                    {p.price}
                  </span>
                  <span
                    className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}
                  >
                    {p.priceNote}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${p.featured ? "text-background/60" : "text-muted-foreground"}`}
                >
                  {p.tagline}
                </p>
              </div>

              <Button
                variant="outline"
                className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 ${
                  p.featured
                    ? "bg-background text-foreground border-background hover:bg-background/90"
                    : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                }`}
                onClick={() => toast.info("Waitlist — coming soon")}
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Join Waitlist
              </Button>

              <ul className="space-y-2 flex-1">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${p.featured ? "text-background/80" : ""}`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.featured ? "text-background/60" : "text-primary"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "oklch(1 0 0 / 0.02)",
            border: "1px dashed oklch(1 0 0 / 0.12)",
          }}
        >
          <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Corporate plan uses a proxy gateway — your team&apos;s requests route through Frugal for real-time attribution and blocking.
            Your traffic goes directly to the provider; we never store prompt or completion content.
            SOC 2 Type II targeted Q4 2026. Questions:{" "}
            <span className="text-foreground font-medium">founder@frugal.dev</span>
          </p>
        </div>
      </div>

      {/* ── Billing History ──────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-sm">Billing History</h3>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Input
                placeholder="Search…"
                className="bg-white/[0.06] border-white/[0.1] h-8 rounded-xl pl-7 text-xs w-32"
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-white/[0.1] text-xs gap-1.5"
              onClick={() => toast.info("Export coming soon")}
            >
              <Download className="w-3 h-3" />
              Export
            </Button>
          </div>
        </div>

        <div className="px-5 py-2.5 border-b border-white/[0.04] grid grid-cols-6 gap-3 text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground/60">
          <span className="col-span-2">Plan Name</span>
          <span>Amount</span>
          <span>Purchase Date</span>
          <span>End Date</span>
          <span>Status</span>
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No billing history yet. Invoice history appears here after your first payment.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {invoices.map((inv) => {
              const month = new Date(inv.period_start * 1000).toLocaleString(
                "en-US",
                { month: "short", year: "numeric" }
              );
              return (
                <div
                  key={inv.id}
                  className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <span className="col-span-2 text-sm">Subscription — {month}</span>
                  <span className="font-mono text-sm font-semibold">
                    {formatAmount(inv.amount_paid, inv.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatDate(inv.period_start)}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatDate(inv.period_end)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getStatusClass(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                    {inv.invoice_pdf ? (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="text-muted-foreground/30 cursor-not-allowed"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported component — wraps inner in Suspense for useSearchParams
// ---------------------------------------------------------------------------

export default function BillingClient(props: BillingClientProps) {
  return (
    <Suspense fallback={null}>
      <BillingClientInner {...props} />
    </Suspense>
  );
}
