"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Building2, Download } from "lucide-react";

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

type Interval = "monthly" | "yearly";

const plans = [
  {
    id: "free",
    name: "Free",
    badge: "FREE",
    badgeClass: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    tagline: "For solo devs and side projects",
    monthly: 0,
    annual: 0,
    saving: 0,
    current: true,
    featured: false,
    cta: "Current Plan",
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
    badge: "PRO",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "For growing products with real budgets",
    monthly: 19,
    annual: 15,
    saving: 48,
    current: false,
    featured: true,
    cta: "Upgrade Plan",
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
    badge: "ADVANCE",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    tagline: "Per-user attribution, unlimited everything",
    monthly: 49,
    annual: 39,
    saving: 120,
    current: false,
    featured: false,
    cta: "Upgrade Plan",
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

const invoices = [
  { id: "INV-002", plan: "Free Plan — Jun 2026", amount: "$0.00", purchaseDate: "2026-06-01", endDate: "2026-06-30", status: "paid" },
  { id: "INV-001", plan: "Free Plan — May 2026", amount: "$0.00", purchaseDate: "2026-05-01", endDate: "2026-05-31", status: "paid" },
];

export default function BillingPage() {
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section header + toggle */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-base">Billing &amp; Subscription</h3>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-lg">
            Manage your subscription, billing info, and payment history.
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
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((p) => {
          const price =
            interval === "yearly" && p.annual > 0 ? p.annual : p.monthly;
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
                    Save ${p.saving}/yr
                  </p>
                )}
              </div>

              <Button
                disabled={p.current}
                onClick={() => {
                  if (!p.current) toast.info("Stripe checkout — coming soon");
                }}
                className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 ${
                  p.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : p.current
                    ? "bg-white/5 text-muted-foreground border border-white/[0.08] cursor-default"
                    : "bg-white/5 hover:bg-white/10 text-foreground border border-white/[0.08]"
                }`}
              >
                {p.cta}
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

      {/* Corporate waitlist */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{
          background: "oklch(1 0 0 / 0.02)",
          border: "1px dashed oklch(1 0 0 / 0.12)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "oklch(1 0 0 / 0.05)",
            border: "1px solid oklch(1 0 0 / 0.08)",
          }}
        >
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Corporate Plan — Waitlist Open</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proxy gateway, real-time blocking, per-employee attribution. Targeting Q3 2026.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 rounded-xl border-white/[0.1] h-9 px-4 text-sm"
          onClick={() => toast.info("Waitlist — coming soon")}
        >
          Join Waitlist
        </Button>
      </div>

      {/* Billing history */}
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

        {/* Table header */}
        <div className="px-5 py-2.5 border-b border-white/[0.04] grid grid-cols-6 gap-3 text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground/60">
          <span className="col-span-2">Plan Name</span>
          <span>Amount</span>
          <span>Purchase Date</span>
          <span>End Date</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center hover:bg-white/[0.02] transition-colors"
            >
              <span className="col-span-2 text-sm">{inv.plan}</span>
              <span className="font-mono text-sm font-semibold">{inv.amount}</span>
              <span className="text-sm text-muted-foreground font-mono">{inv.purchaseDate}</span>
              <span className="text-sm text-muted-foreground font-mono">{inv.endDate}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                  {inv.status}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => toast.info("Download — coming soon")}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
