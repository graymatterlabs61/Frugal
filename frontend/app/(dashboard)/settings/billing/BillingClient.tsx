"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  Building2,
  ArrowRight,
  Download,
  CreditCard,
  ExternalLink,
  BarChart2,
  Crown,
  Receipt,
  Sparkles,
} from "lucide-react";
import type { PersonalPlan, CorporatePlan, PlansResponse } from "@/lib/queries/public";
import type { Invoice, PaymentMethodInfo, UsageData } from "@/lib/queries/billing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BillingClientProps {
  currentPlan: string;
  hasStripeCustomer: boolean;
  plans: PlansResponse | null;
  invoices: Invoice[];
  usage: UsageData | null;
  paymentMethod: PaymentMethodInfo | null;
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const CORPORATE_PLANS = new Set(["corp_starter", "corp_growth", "corp_scale", "enterprise"]);

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

type Interval = "monthly" | "yearly";
type LoadingPlan = null | "plus" | "pro";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
  corp_starter: "Starter",
  corp_growth: "Growth",
  corp_scale: "Scale",
  enterprise: "Enterprise",
};

function planDisplayName(plan: string): string {
  return PLAN_NAMES[plan] ?? plan;
}

function getPlanMeta(currentPlan: string, plans: PlansResponse | null) {
  const personal = plans?.personal.find((p) => p.id === currentPlan);
  if (personal) {
    return {
      badge: personal.badge,
      badgeClass: personal.badgeClass,
      price: personal.monthlyPrice === 0 ? "Free" : `$${personal.monthlyPrice}/mo`,
    };
  }
  const corporate = plans?.corporate.find((p) => p.id === currentPlan);
  if (corporate) {
    return {
      badge: corporate.badge,
      badgeClass: corporate.badgeClass,
      price: corporate.id === "enterprise" ? "Contact us" : corporate.price,
    };
  }
  return {
    badge: "FREE",
    badgeClass: "text-muted-foreground border-muted-foreground/30",
    price: "Free",
  };
}

function formatDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InvoiceStatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border";
  if (status === "paid")
    return (
      <span className={`${base} text-emerald-400 bg-emerald-500/10 border-emerald-500/20`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Paid
      </span>
    );
  if (status === "open")
    return (
      <span className={`${base} text-yellow-400 bg-yellow-500/10 border-yellow-500/20`}>
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Open
      </span>
    );
  if (status === "void")
    return (
      <span className={`${base} text-muted-foreground bg-white/5 border-white/10`}>Void</span>
    );
  return (
    <span className={`${base} text-red-400 bg-red-500/10 border-red-500/20`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Failed
    </span>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const danger = !unlimited && pct >= 85;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-mono font-semibold ${danger ? "text-red-400" : ""}`}>
          {unlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06]">
        {unlimited ? (
          <div className="h-full w-full rounded-full bg-primary/15" />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              danger ? "bg-red-500" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner component
// ---------------------------------------------------------------------------

function BillingClientInner({
  currentPlan,
  hasStripeCustomer,
  plans,
  invoices,
  usage,
  paymentMethod,
}: BillingClientProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState<LoadingPlan>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const backendToken = session?.backendToken;
  const isCorporate = CORPORATE_PLANS.has(currentPlan);
  const planMeta = getPlanMeta(currentPlan, plans);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Plan upgraded successfully!");
    }
  }, [searchParams]);

  async function handleUpgrade(planId: "plus" | "pro") {
    if (!backendToken) {
      toast.error("Session expired. Please sign in again.");
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          plan: planId,
          successUrl: `${window.location.origin}/settings/billing?success=1`,
          cancelUrl: `${window.location.origin}/settings/billing`,
        }),
      });
      const json = (await res.json()) as {
        data?: { url?: string };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Checkout failed");
      window.location.assign(json.data!.url!);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(null);
    }
  }

  async function handlePortal() {
    if (!backendToken) {
      toast.error("Session expired. Please sign in again.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/billing/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({ returnUrl: `${window.location.origin}/settings/billing` }),
      });
      const json = (await res.json()) as {
        data?: { url?: string };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Portal unavailable");
      window.location.assign(json.data!.url!);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Portal unavailable");
      setPortalLoading(false);
    }
  }

  const personalPlans = plans?.personal ?? [];
  const corporatePlans = plans?.corporate ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── 1. Subscription Overview ─────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-5">

        {/* Current Plan */}
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Current Plan</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {planDisplayName(currentPlan)}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{planMeta.price}</p>
              </div>
              <span
                className={`mt-1 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${planMeta.badgeClass}`}
              >
                {planMeta.badge}
              </span>
            </div>

            {hasStripeCustomer ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/[0.10] h-9 px-4 text-sm w-fit gap-2 hover:bg-white/[0.06]"
                onClick={() => void handlePortal()}
                disabled={portalLoading}
              >
                {portalLoading ? "Opening…" : "Manage Subscription"}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active subscription.{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  View plans →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Usage</h3>
          </div>
          <div className="p-5">
            {usage ? (
              <div className="space-y-5">
                <UsageBar
                  label="API Connections"
                  used={usage.connections}
                  limit={usage.limits.connections}
                />
                <UsageBar
                  label="Projects"
                  used={usage.projects}
                  limit={usage.limits.projects}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Usage data unavailable
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Plan Options ──────────────────────────────────────────────── */}
      {!isCorporate ? (
        /* ── Personal plan grid ── */
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Personal Plans</h3>
            </div>
            {/* Interval toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl shrink-0"
              style={{
                background: "oklch(1 0 0 / 0.04)",
                border: "1px solid oklch(1 0 0 / 0.08)",
              }}
            >
              {(["monthly", "yearly"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setInterval(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                    interval === v
                      ? "bg-white/[0.10] text-foreground border border-white/[0.10]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}
                  {v === "yearly" && (
                    <span className="ml-1 text-[10px] text-emerald-400 font-bold">−2mo</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="grid sm:grid-cols-3 gap-4">
              {personalPlans.map((p: PersonalPlan) => {
                const isCurrent = p.id === currentPlan;
                const price =
                  interval === "yearly" && p.yearlyPrice > 0
                    ? p.yearlyPrice
                    : p.monthlyPrice;
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
                        : {
                            background: "oklch(1 0 0 / 0.03)",
                            border: "1px solid oklch(1 0 0 / 0.07)",
                          }
                    }
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-bold text-sm ${p.featured ? "text-background" : ""}`}>
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
                          className={`text-2xl font-bold font-mono ${
                            p.featured ? "text-background" : ""
                          }`}
                        >
                          {price === 0 ? "$0" : `$${price}`}
                        </span>
                        <span
                          className={`text-xs ${
                            p.featured ? "text-background/60" : "text-muted-foreground"
                          }`}
                        >
                          {price === 0 ? "/ forever" : "/mo"}
                        </span>
                      </div>
                      {interval === "yearly" && p.yearlySaving > 0 && (
                        <p
                          className={`text-xs mt-0.5 ${
                            p.featured ? "text-background/60" : "text-emerald-400"
                          }`}
                        >
                          Save ${p.yearlySaving}/yr
                        </p>
                      )}
                    </div>

                    <Button
                      disabled={isCurrent || loading === p.id}
                      onClick={() => {
                        if (!isCurrent && (p.id === "plus" || p.id === "pro")) {
                          void handleUpgrade(p.id);
                        }
                      }}
                      size="sm"
                      className={`w-full rounded-xl h-9 text-xs font-semibold mb-4 ${
                        p.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : isCurrent
                          ? "bg-white/5 text-muted-foreground border border-white/[0.08] cursor-default"
                          : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                      }`}
                    >
                      {loading === p.id
                        ? "Loading…"
                        : isCurrent
                        ? "Current Plan"
                        : p.ctaLabel}
                    </Button>

                    <ul className="space-y-1.5 flex-1">
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className={`flex items-start gap-2 text-xs ${
                            p.featured ? "text-background/80" : "text-muted-foreground"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 shrink-0 mt-0.5 ${
                              p.featured ? "text-background/50" : "text-primary"
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Corporate upsell footer */}
            <div
              className="mt-4 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3"
              style={{
                background: "oklch(1 0 0 / 0.02)",
                border: "1px dashed oklch(1 0 0 / 0.12)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-sm font-semibold">Corporate Plans</span>
                  <span className="text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border text-yellow-400 bg-yellow-500/10 border-yellow-500/30">
                    Q3 2026
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proxy gateway · Real-time spend blocking · Per-employee attribution
                </p>
              </div>
              <Link
                href="/pricing?tab=corporate"
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View plans <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ── Corporate plan section ── */
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Corporate Plans</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {corporatePlans.map((p: CorporatePlan) => {
                const isCurrent = p.id === currentPlan;
                return (
                  <div
                    key={p.id}
                    className="rounded-xl p-4 flex flex-col"
                    style={
                      isCurrent
                        ? {
                            background:
                              "linear-gradient(145deg, oklch(0.97 0 0 / 0.95) 0%, oklch(0.92 0 0 / 0.9) 100%)",
                            border: "1px solid oklch(1 0 0 / 0.3)",
                          }
                        : {
                            background: "oklch(1 0 0 / 0.03)",
                            border: "1px solid oklch(1 0 0 / 0.07)",
                          }
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-bold text-sm ${isCurrent ? "text-background" : ""}`}
                      >
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border text-background/70 bg-black/10 border-black/20">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xl font-bold font-mono mb-0.5 ${
                        isCurrent ? "text-background" : ""
                      }`}
                    >
                      {p.price}
                    </p>
                    <p
                      className={`text-xs mb-3 ${
                        isCurrent ? "text-background/60" : "text-muted-foreground"
                      }`}
                    >
                      {p.seats}
                    </p>
                    <ul className="space-y-1.5 flex-1">
                      {p.features.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className={`flex items-start gap-1.5 text-[11px] ${
                            isCurrent ? "text-background/75" : "text-muted-foreground"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 shrink-0 mt-0.5 ${
                              isCurrent ? "text-background/50" : "text-primary"
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div
              className="rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3"
              style={{
                background: "oklch(1 0 0 / 0.02)",
                border: "1px dashed oklch(1 0 0 / 0.12)",
              }}
            >
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold">Need to change your tier?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contact us to upgrade, downgrade, or adjust seat count.
                </p>
              </div>
              <a
                href="mailto:hello@getfrugal.dev?subject=Corporate%20Plan%20Change"
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Contact us <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Billing History ───────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Billing History</h3>
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No invoices yet — they&apos;ll appear here after your first payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Date", "Description", "Amount", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground/60"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      i < invoices.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-5 py-3.5 text-sm max-w-[180px] truncate">
                      {inv.description}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono whitespace-nowrap">
                      {formatAmount(inv.amount, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {inv.pdfUrl ? (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Payment Method ────────────────────────────────────────────── */}
      {hasStripeCustomer && (
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Payment Method</h3>
          </div>

          <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
            {/* Card visual */}
            {paymentMethod ? (
              <div
                className="relative rounded-2xl p-5 w-full sm:w-64 shrink-0 flex flex-col justify-between min-h-[130px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,80,11,0.28) 0%, oklch(0.14 0.04 280) 55%, oklch(0.10 0.02 270) 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,80,11,0.22)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 40px rgba(255,80,11,0.07)",
                }}
              >
                {/* Brand */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono font-extrabold text-base tracking-widest text-white/90 uppercase">
                    {paymentMethod.brand}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-white/20" />
                    <div className="w-5 h-5 rounded-full bg-white/10 -ml-2.5" />
                  </div>
                </div>
                {/* Number */}
                <div>
                  <p className="font-mono text-base tracking-[0.18em] text-white/75 mb-3">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider">
                    Expires{" "}
                    {String(paymentMethod.expMonth).padStart(2, "0")}/
                    {String(paymentMethod.expYear).slice(-2)}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl w-full sm:w-64 shrink-0 min-h-[130px] flex flex-col items-center justify-center gap-2"
                style={{
                  background: "oklch(1 0 0 / 0.02)",
                  border: "1px dashed oklch(1 0 0 / 0.12)",
                }}
              >
                <CreditCard className="w-6 h-6 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground/50">No card on file</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 flex-1 justify-center pt-1">
              <div>
                <p className="text-sm font-semibold">
                  {paymentMethod ? "Card on file" : "No payment method"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {paymentMethod
                    ? "Update or remove your card via the Stripe billing portal."
                    : "Add a card to enable paid plan upgrades."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/[0.10] h-9 px-4 text-sm w-fit gap-2 hover:bg-white/[0.06]"
                onClick={() => void handlePortal()}
                disabled={portalLoading}
              >
                <CreditCard className="w-3.5 h-3.5" />
                {portalLoading
                  ? "Opening…"
                  : paymentMethod
                  ? "Update Payment Method"
                  : "Add Payment Method"}
                <ExternalLink className="w-3 h-3 opacity-40" />
              </Button>
              <p className="text-[11px] text-muted-foreground/50">
                Secured by Stripe. Card details never touch our servers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported — Suspense wrapper required for useSearchParams
// ---------------------------------------------------------------------------

export default function BillingClient(props: BillingClientProps) {
  return (
    <Suspense fallback={null}>
      <BillingClientInner {...props} />
    </Suspense>
  );
}
