"use client";

import { useState } from "react";
import { Check, Crown, Zap, Building2, Copy, Shield, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SettingsClientProps {
  userName: string;
  userEmail: string;
}

type BillingInterval = "monthly" | "yearly";

/* ── helpers ────────────────────────────────────────────── */

const Toggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${checked && !disabled ? "bg-primary" : "bg-white/10"}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`}
    />
  </button>
);

/* ── billing plans data ─────────────────────────────────── */

const billingPlans = [
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

const billingInvoices = [
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

/* ── component ──────────────────────────────────────────── */

export function SettingsClient({ userName, userEmail }: SettingsClientProps) {
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [webhookAlerts, setWebhookAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  // Hardcoded until settings are wired to real plan data in Phase 7
  const plan = "Free" as "Free" | "Plus" | "Pro";
  const initial = (name || userEmail || "U")[0].toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 8) { toast.error("Minimum 8 characters"); return; }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword(""); setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setChangingPassword(false);
    }
  };

  /* tab list */
  const tabs = [
    "Account",
    "Team Management",
    "Preferences",
    "Integration",
    "Billing & Subscription",
    "Security",
    "Report & Analytics",
  ];

  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="flex items-center justify-between pb-5 border-b border-border mb-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account, billing, and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-4 text-sm border-border/50"
            onClick={() => { setName(userName); toast.info("Changes discarded"); }}
          >
            Cancel
          </Button>
          <Button
            disabled={saving}
            className="bg-foreground hover:bg-foreground/90 text-background rounded-xl h-9 px-4 text-sm font-semibold"
            onClick={() => {
              const form = document.getElementById("profile-form") as HTMLFormElement | null;
              form?.requestSubmit();
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="Account">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {/* Scrollable tab bar */}
          <div className="overflow-x-auto pb-0.5 -mb-0.5 flex-1">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-0.5 flex min-w-max">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg px-3.5 h-9 text-sm font-medium whitespace-nowrap
                    data-[state=active]:bg-card data-[state=active]:text-foreground
                    data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border
                    text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Search settings */}
          <div className="relative shrink-0 hidden sm:block">
            <Input
              placeholder="Search settings…"
              className="bg-input/20 border-border/40 h-9 rounded-xl pl-8 text-sm w-44"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* ── Account ──────────────────────────────────── */}
        <TabsContent value="Account">
          <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
            <div className="border border-border rounded-2xl bg-card p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary shrink-0 select-none">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{name || "User"}</p>
                <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-white/5 border border-border text-muted-foreground">
                  {plan} Plan
                </span>
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Personal Information</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-input/30 border-border/40 h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <Input value={userEmail} disabled className="bg-input/10 border-border/20 h-10 rounded-xl opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ── Team Management ──────────────────────────── */}
        <TabsContent value="Team Management">
          <div className="max-w-2xl space-y-5">
            <div className="border border-border rounded-2xl bg-card p-8 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-border flex items-center justify-center">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
              </div>
              <p className="font-semibold">Team features coming in V1.1</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Invite teammates, set per-member access levels, and share project dashboards. Targeting V1.1.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ── Preferences ──────────────────────────────── */}
        <TabsContent value="Preferences">
          <div className="max-w-2xl space-y-5">
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Display</h3>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Default dashboard view", hint: "What shows first when you open the dashboard", options: ["Overview", "Projects", "Alerts"] },
                  { label: "Currency", hint: "Currency for spend display", options: ["USD ($)", "EUR (€)", "GBP (£)"] },
                  { label: "Date format", hint: "How dates are displayed across the app", options: ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] },
                ].map(({ label, hint, options }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                    </div>
                    <select className="bg-input/30 border border-border/40 rounded-xl px-3 h-9 text-sm text-foreground shrink-0">
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Dashboard Defaults</h3>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Show burn rate on overview", sub: "Displays projected monthly spend" },
                  { label: "Show last-polled timestamp", sub: "Shown on each provider card" },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Integration ──────────────────────────────── */}
        <TabsContent value="Integration">
          <div className="max-w-2xl space-y-5">
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Programmatic API Access</h3>
                <span className="text-[10px] font-bold font-mono uppercase bg-white/5 text-muted-foreground border border-border px-1.5 py-0.5 rounded-md">Pro · V1.1</span>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">
                  REST API for reading spend data and managing budget rules from your own dashboards or CI/CD pipelines.
                </p>
                <div className="bg-white/3 border border-border/40 rounded-xl p-4 font-mono text-xs space-y-1 text-muted-foreground">
                  <p><span className="text-primary">GET</span>  /api/v1/projects</p>
                  <p><span className="text-primary">GET</span>  /api/v1/projects/:id/spend</p>
                  <p><span className="text-primary">POST</span> /api/v1/projects/:id/budget-rules</p>
                  <p><span className="text-primary">GET</span>  /api/v1/usage</p>
                </div>
                <Button variant="outline" className="mt-4 rounded-xl h-9 px-4 text-sm border-border/40 opacity-50 cursor-not-allowed" disabled>
                  Generate API Key — V1.1
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Slack Webhook</h3>
                <span className="text-[10px] font-bold font-mono uppercase bg-white/5 text-muted-foreground border border-border px-1.5 py-0.5 rounded-md">Plus / Pro</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Send budget alerts to Slack</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Posts to your channel via incoming webhook URL</p>
                  </div>
                  <Toggle checked={slackAlerts} onChange={setSlackAlerts} disabled={plan === "Free"} />
                </div>
                {slackAlerts && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Webhook URL</label>
                    <Input value={slackWebhook} onChange={(e) => setSlackWebhook(e.target.value)} placeholder="https://hooks.slack.com/services/…" className="bg-input/30 border-border/40 h-10 rounded-xl font-mono text-sm" />
                  </div>
                )}
                {plan === "Free" && <p className="text-xs text-muted-foreground bg-white/3 border border-border/40 rounded-xl px-3 py-2">Upgrade to Plus or Pro to enable Slack alerts.</p>}
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">HMAC Webhook</h3>
                <span className="text-[10px] font-bold font-mono uppercase bg-white/5 text-muted-foreground border border-border px-1.5 py-0.5 rounded-md">Pro</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Signed webhook to custom endpoint</p>
                    <p className="text-xs text-muted-foreground mt-0.5">POST with X-Frugal-Signature header for verification</p>
                  </div>
                  <Toggle checked={webhookAlerts} onChange={setWebhookAlerts} disabled={plan !== "Pro"} />
                </div>
                {webhookAlerts && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Endpoint URL</label>
                      <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhooks/frugal" className="bg-input/30 border-border/40 h-10 rounded-xl font-mono text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Signing Secret</label>
                      <div className="flex gap-2">
                        <Input value="whsec_frugal_••••••••••••••••" disabled className="bg-input/10 border-border/20 h-10 rounded-xl font-mono text-sm opacity-60 flex-1" />
                        <Button type="button" variant="outline" className="h-10 rounded-xl border-border/40 shrink-0" onClick={() => { navigator.clipboard.writeText("whsec_example"); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </>
                )}
                {plan !== "Pro" && <p className="text-xs text-muted-foreground bg-white/3 border border-border/40 rounded-xl px-3 py-2">Upgrade to Pro to enable HMAC webhooks.</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Billing & Subscription ───────────────────── */}
        <TabsContent value="Billing & Subscription">
          <div className="space-y-6">
            {/* Section header + toggle */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-base">Billing &amp; Subscription</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Keep track of your subscription details, update your billing information, and control your account&apos;s payment.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/5 border border-border rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setBillingInterval("monthly")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${billingInterval === "monthly" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval("yearly")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${billingInterval === "yearly" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {billingPlans.map((p) => {
                const price = billingInterval === "yearly" && p.annual > 0 ? p.annual : p.monthly;
                return (
                  <div
                    key={p.id}
                    className={`border rounded-2xl p-5 relative flex flex-col ${
                      p.featured
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card border-border"
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-bold text-base ${p.featured ? "text-background" : ""}`}>{p.name}</h3>
                      <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-md border ${p.featured ? "text-background/70 bg-white/10 border-white/20" : p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold font-mono ${p.featured ? "text-background" : ""}`}>
                          {price === 0 ? "$0" : `$${price}`}
                        </span>
                        <span className={`text-sm ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>
                          {price === 0 ? "/ forever" : "/month"}
                        </span>
                      </div>
                      {billingInterval === "yearly" && p.saving > 0 && (
                        <p className={`text-xs mt-0.5 ${p.featured ? "text-background/60" : "text-emerald-400"}`}>
                          Save ${p.saving}/yr
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <Button
                      disabled={p.current}
                      onClick={() => { if (!p.current) toast.info("Stripe checkout — coming soon"); }}
                      className={`w-full rounded-xl h-10 text-sm font-semibold mb-5 ${
                        p.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : p.current
                            ? "bg-white/5 text-muted-foreground border border-border cursor-default"
                            : "bg-white/5 hover:bg-white/10 text-foreground border border-border"
                      }`}
                    >
                      {p.cta}
                    </Button>

                    {/* Features */}
                    <ul className="space-y-2 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className={`flex items-start gap-2 text-sm ${p.featured ? "text-background/80" : ""}`}>
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.featured ? "text-background/60" : "text-primary"}`} />
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
                <p className="text-xs text-muted-foreground mt-0.5">Proxy gateway, real-time blocking, per-employee attribution. Targeting Q3 2026.</p>
              </div>
              <Button variant="outline" className="shrink-0 rounded-xl border-border/40 h-9 px-4 text-sm" onClick={() => toast.info("Waitlist — coming soon")}>
                Join Waitlist
              </Button>
            </div>

            {/* Billing history */}
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Billing History</h3>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <Input placeholder="Search…" className="bg-input/20 border-border/40 h-8 rounded-xl pl-7 text-xs w-32" />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl border-border/40 text-xs gap-1.5" onClick={() => toast.info("Export coming soon")}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Export
                  </Button>
                </div>
              </div>
              {/* Table header */}
              <div className="px-5 py-2.5 border-b border-border/50 grid grid-cols-6 gap-3 text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground/60">
                <span className="col-span-2">Plan Name</span>
                <span>Amounts</span>
                <span>Purchase Date</span>
                <span>End Date</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-border">
                {billingInvoices.map((inv) => (
                  <div key={inv.id} className="px-5 py-3.5 grid grid-cols-6 gap-3 items-center hover:bg-white/2 transition-colors">
                    <span className="col-span-2 text-sm">{inv.plan}</span>
                    <span className="font-mono text-sm font-semibold">{inv.amount}</span>
                    <span className="text-sm text-muted-foreground font-mono">{inv.purchaseDate}</span>
                    <span className="text-sm text-muted-foreground font-mono">{inv.endDate}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                        {inv.status}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => toast.info("Download — coming soon")}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Security ─────────────────────────────────── */}
        <TabsContent value="Security">
          <div className="max-w-2xl space-y-5">
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Change Password</h3>
              </div>
              <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">New Password</label>
                    <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="bg-input/30 border-border/40 h-10 rounded-xl" showStrength />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                    <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="bg-input/30 border-border/40 h-10 rounded-xl" />
                  </div>
                </div>
                <Button type="submit" disabled={changingPassword || !newPassword} variant="outline" className="rounded-xl h-9 px-4 text-sm border-border/40">
                  {changingPassword ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Active Sessions</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-semibold">Current session</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Browser · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">Active</span>
                </div>
              </div>
            </div>

            <div className="border border-destructive/30 rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-destructive/20 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-sm text-destructive">Danger Zone</h3>
              </div>
              <div className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Delete Account</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">Permanently delete your account and all data. Cannot be undone.</p>
                </div>
                <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 rounded-xl h-9 px-4 text-sm shrink-0" onClick={() => toast.error("Contact support@frugal.so to delete your account")}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Report & Analytics ───────────────────────── */}
        <TabsContent value="Report & Analytics">
          <div className="max-w-2xl space-y-5">
            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Usage Reports</h3>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Monthly spend summary", sub: "Email on 1st of each month", enabled: true },
                  { label: "Weekly digest", sub: "Email every Monday morning", enabled: false },
                  { label: "Alert frequency report", sub: "Monthly summary of triggered rules", enabled: false },
                ].map(({ label, sub, enabled }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                    <Toggle checked={enabled} onChange={() => toast.info("Coming soon")} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Data Export</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Export usage records (CSV)", desc: "All usage_records rows for your account" },
                  { label: "Export alert log (CSV)", desc: "Full alert history with delivery status" },
                  { label: "Export billing history (CSV)", desc: "Invoice and payment records" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 text-xs border-border/40 shrink-0" onClick={() => toast.info("Export — coming soon")}>
                      Export
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
