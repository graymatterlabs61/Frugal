"use client";

import { useState } from "react";
import { Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Interval = "monthly" | "yearly";

const plans = [
  {
    id: "free",
    name: "Free",
    badge: "FREE",
    badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    tagline: "For solo devs and side projects",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
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
    badgeColor: "text-white bg-primary border-primary/60",
    tagline: "For growing products with real budgets",
    monthly: 19,
    annual: 15,
    annualTotal: 180,
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
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    tagline: "Per-user attribution, unlimited everything",
    monthly: 49,
    annual: 39,
    annualTotal: 468,
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
];

const invoices = [
  {
    id: "INV-002",
    plan: "Free Plan — Jun 2026",
    amount: "$0.00",
    purchaseDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "paid",
  },
  {
    id: "INV-001",
    plan: "Free Plan — May 2026",
    amount: "$0.00",
    purchaseDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "paid",
  },
];

export default function BillingPage() {
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Billing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Keep track of your subscription details, update your billing information, and control your account&apos;s payment.
          </p>
        </div>
        {/* Monthly / Yearly toggle */}
        <div className="flex items-center gap-1 bg-white/5 border border-border rounded-xl p-1 shrink-0">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              interval === "monthly"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              interval === "yearly"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plan cards — featured (middle) fully dark */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const price =
            interval === "yearly" && plan.annual > 0 ? plan.annual : plan.monthly;

          return (
            <div
              key={plan.id}
              className={`border rounded-2xl p-5 relative flex flex-col transition-all ${
                plan.featured
                  ? "bg-foreground text-background border-foreground shadow-lg scale-[1.01]"
                  : "bg-card border-border"
              }`}
            >
              {/* Name + badge row */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-base ${plan.featured ? "text-background" : ""}`}>
                  {plan.name}
                </h3>
                <span
                  className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${
                    plan.featured
                      ? "text-background/70 bg-white/10 border-white/20"
                      : plan.badgeColor
                  }`}
                >
                  {plan.badge}
                </span>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold font-mono ${plan.featured ? "text-background" : ""}`}
                  >
                    {price === 0 ? "$0" : `$${price}.00`}
                  </span>
                  <span
                    className={`text-sm ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                  >
                    {price === 0 ? "/ forever" : "/month"}
                  </span>
                </div>
                {interval === "yearly" && plan.saving > 0 && (
                  <p className={`text-xs mt-1 font-semibold ${plan.featured ? "text-background/60" : "text-emerald-400"}`}>
                    Save ${plan.saving}/yr · ${plan.annualTotal}/yr total
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                disabled={plan.current}
                onClick={() => { if (!plan.current) toast.info("Stripe checkout — coming soon"); }}
                className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 ${
                  plan.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : plan.current
                      ? "bg-white/5 text-muted-foreground border border-border cursor-default"
                      : "bg-white/5 hover:bg-white/10 text-foreground border border-border"
                }`}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${plan.featured ? "text-background/80" : ""}`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.featured ? "text-background/50" : "text-primary"}`}
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
      <div className="border border-dashed border-border/50 rounded-2xl p-5 flex items-center gap-4 bg-white/1">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-border/50 flex items-center justify-center shrink-0">
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
          className="shrink-0 rounded-xl border-border/40 h-9 px-4 text-sm"
          onClick={() => toast.info("Waitlist — coming soon")}
        >
          Join Waitlist
        </Button>
      </div>

      {/* Billing history table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-sm">Billing History</h3>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Input
                placeholder="Search…"
                className="bg-input/20 border-border/40 h-8 rounded-xl pl-7 text-xs w-36"
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
              className="h-8 rounded-xl border-border/40 text-xs gap-1.5"
              onClick={() => toast.info("Filter — coming soon")}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 5.25M17.25 9l3.75 3.75" />
              </svg>
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-border/40 text-xs gap-1.5"
              onClick={() => toast.info("Export — coming soon")}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </Button>
          </div>
        </div>

        {/* Table head */}
        <div className="px-5 py-2.5 border-b border-border/50 grid grid-cols-6 gap-3 text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground/60">
          <span className="col-span-2">Plan Name</span>
          <span>Amounts</span>
          <span>Purchase Date</span>
          <span>End Date</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-border">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center hover:bg-white/2 transition-colors"
            >
              <span className="col-span-2 text-sm">{inv.plan}</span>
              <span className="font-mono text-sm font-semibold">{inv.amount}</span>
              <span className="text-sm text-muted-foreground font-mono">{inv.purchaseDate}</span>
              <span className="text-sm text-muted-foreground font-mono">{inv.endDate}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold capitalize">
                  {inv.status}
                </span>
                <button
                  className="p-1 rounded hover:text-foreground text-muted-foreground transition-colors"
                  onClick={() => toast.info("Download — coming soon")}
                  title="Download"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <button
                  className="p-1 rounded hover:text-foreground text-muted-foreground transition-colors"
                  onClick={() => toast.info("View invoice — coming soon")}
                  title="View"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
