"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash,
  Bell,
  PlugsConnected,
  Shield,
  Lightning,
  CheckCircle,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { canCreateBudgetRules, canUseThrottle } from "@/lib/tier";
import type {
  ProjectStats,
  ProjectConnection,
  ProjectAlert,
} from "@/lib/queries/dashboard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectDetailClientProps {
  project: ProjectStats;
  connections: ProjectConnection[];
  alerts: ProjectAlert[];
  userPlan: string;
}

interface BudgetRule {
  id: string;
  limit_usd: number;
  budget_window: "daily" | "monthly";
  action: "alert" | "block" | "throttle";
  threshold_pct: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const statusStyles: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const modelBreakdown = [
  { model: "gpt-4o", spend: 89.3, tokens: "1.2M" },
  { model: "gpt-4o-mini", spend: 34.7, tokens: "8.4M" },
  { model: "text-embedding-3-small", spend: 18.5, tokens: "45M" },
];

const connStatusConfig: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  active: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Active",
  },
  polling_error: {
    icon: Warning,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    label: "Polling Error",
  },
  invalid: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "Invalid",
  },
};

const actionConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  alert: {
    label: "Alert",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: Bell,
  },
  block: {
    label: "Block",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: Shield,
  },
  throttle: {
    label: "Throttle",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Lightning,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "Never polled";
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function mapStatus(dbStatus: string): "healthy" | "warning" | "critical" {
  if (dbStatus === "warning") return "warning";
  if (dbStatus === "critical") return "critical";
  return "healthy";
}

// ---------------------------------------------------------------------------
// AddRuleDialog
// ---------------------------------------------------------------------------

function AddRuleDialog({
  project,
  userPlan,
  onAdd,
}: {
  project: ProjectStats;
  userPlan: string;
  onAdd: (r: BudgetRule) => void;
}) {
  const [open, setOpen] = useState(false);
  const [thresholdPct, setThresholdPct] = useState("80");
  const [action, setAction] = useState<"alert" | "block" | "throttle">("alert");
  const [limitUsd, setLimitUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const needsLimitField = project.budgetLimit === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const threshold = parseInt(thresholdPct);
    if (isNaN(threshold) || threshold < 1 || threshold > 100) {
      setFormError("Threshold must be between 1 and 100.");
      return;
    }

    const limitValue = needsLimitField ? parseFloat(limitUsd) : undefined;
    if (needsLimitField && (!limitUsd || isNaN(limitValue!) || limitValue! <= 0)) {
      setFormError("Set a monthly budget limit on this project first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/budget-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          thresholdPct: threshold,
          action,
          ...(limitValue !== undefined && { limitUsd: limitValue }),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? "Failed to create rule.");
        return;
      }
      onAdd(json.rule);
      toast.success("Budget rule created");
      setOpen(false);
      setThresholdPct("80");
      setAction("alert");
      setLimitUsd("");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-3 text-sm font-semibold">
          <Plus size={14} className="mr-1.5" />
          New Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Create Budget Rule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Alert at (% of budget)
            </label>
            <Input
              type="number"
              value={thresholdPct}
              onChange={(e) => setThresholdPct(e.target.value)}
              placeholder="80"
              min="1"
              max="100"
              className="bg-input/30 border-border/40 h-10 rounded-xl font-mono"
            />
          </div>

          {needsLimitField && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Monthly Budget ($)
              </label>
              <Input
                type="number"
                value={limitUsd}
                onChange={(e) => setLimitUsd(e.target.value)}
                placeholder="200"
                min="1"
                step="0.01"
                className="bg-input/30 border-border/40 h-10 rounded-xl font-mono"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Action
            </label>
            <RadioGroup
              value={action}
              onValueChange={(v) => setAction(v as "alert" | "block" | "throttle")}
              className="space-y-2"
            >
              <Label
                htmlFor="action-alert"
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  action === "alert"
                    ? "border-primary bg-primary/5"
                    : "border-border/40 bg-input/20"
                }`}
              >
                <RadioGroupItem value="alert" id="action-alert" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Bell size={14} className="text-yellow-400" />
                    Alert
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Send email/Slack notification when threshold is crossed
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="action-block"
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  action === "block"
                    ? "border-primary bg-primary/5"
                    : "border-border/40 bg-input/20"
                }`}
              >
                <RadioGroupItem value="block" id="action-block" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield size={14} className="text-destructive" weight="fill" />
                    Block
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Record a block event and fire notification
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="action-throttle"
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  canUseThrottle(userPlan)
                    ? "cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                } ${
                  action === "throttle"
                    ? "border-primary bg-primary/5"
                    : "border-border/40 bg-input/20"
                }`}
              >
                <RadioGroupItem
                  value="throttle"
                  id="action-throttle"
                  className="mt-0.5"
                  disabled={!canUseThrottle(userPlan)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lightning size={14} className="text-blue-400" weight="fill" />
                    Throttle
                    <Badge className="text-[9px] font-bold px-1.5 py-0 bg-blue-500/20 text-blue-400 border-blue-500/30 rounded-md">
                      Pro
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Slow down requests at threshold (Pro only)
                  </p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl h-10 border-border/40"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-semibold"
            >
              {loading ? "Saving…" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProjectDetailClient({
  project,
  connections,
  alerts,
  userPlan,
}: ProjectDetailClientProps) {
  const [rules, setRules] = useState<BudgetRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(project.slackWebhookUrl ?? "");
  const [slackSaving, setSlackSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/budget-rules?projectId=${project.id}`)
      .then((r) => r.json())
      .then((data) => {
        setRules(data.rules ?? []);
        setRulesLoading(false);
      })
      .catch(() => setRulesLoading(false));
  }, [project.id]);

  const handleDeleteRule = async (ruleId: string) => {
    setDeletingId(ruleId);
    try {
      const res = await fetch(`/api/budget-rules/${ruleId}`, { method: "DELETE" });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        toast.success("Rule deleted");
      } else {
        toast.error("Failed to delete rule");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleSaveSlackWebhook = async () => {
    setSlackSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slack_webhook_url: slackWebhookUrl || null }),
      });
      if (res.ok) {
        toast.success("Slack webhook saved");
      } else {
        toast.error("Failed to save webhook URL");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSlackSaving(false);
    }
  };

  const displayStatus = mapStatus(project.status);
  const statusStyle = statusStyles[displayStatus] ?? statusStyles.healthy;

  const hasBudget = project.budgetLimit !== null;
  const budgetPct = hasBudget
    ? Math.round((project.monthlySpend / project.budgetLimit!) * 100)
    : null;

  let daysUntilLimit: number | null = null;
  if (hasBudget && project.burnRateDaily > 0 && project.budgetLimit !== null) {
    const remaining =
      (project.budgetLimit - project.monthlySpend) / project.burnRateDaily;
    if (remaining < 14) {
      daysUntilLimit = Math.max(0, Math.round(remaining));
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold font-mono">{project.name}</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}
              >
                {displayStatus}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md shrink-0 bg-white/5 text-muted-foreground">
            {connections.length} connection
            {connections.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Spend This Month
          </p>
          <p className="text-2xl font-bold font-mono">
            ${project.monthlySpend.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            of{" "}
            {hasBudget ? `$${project.budgetLimit} budget` : "No budget set"}
          </p>
        </div>

        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Budget Used
          </p>
          {hasBudget && budgetPct !== null ? (
            <>
              <p
                className={`text-2xl font-bold font-mono ${
                  budgetPct >= 100
                    ? "text-destructive"
                    : budgetPct >= 80
                      ? "text-yellow-400"
                      : "text-emerald-400"
                }`}
              >
                {budgetPct}%
              </p>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    budgetPct >= 100
                      ? "bg-destructive"
                      : budgetPct >= 80
                        ? "bg-yellow-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, budgetPct)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-2xl font-bold font-mono text-muted-foreground">
              —
            </p>
          )}
        </div>

        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Burn Rate
          </p>
          <p className="text-2xl font-bold font-mono">
            ${project.burnRateDaily.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per day avg</p>
        </div>

        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Projected / Month
          </p>
          <p
            className={`text-2xl font-bold font-mono ${
              hasBudget &&
              project.projectedMonthly > (project.budgetLimit ?? Infinity)
                ? "text-destructive"
                : "text-foreground"
            }`}
          >
            ${project.projectedMonthly.toFixed(0)}
          </p>
          {daysUntilLimit !== null && (
            <p className="text-xs text-yellow-400 mt-1">
              ~{daysUntilLimit}d until limit
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5 border border-border rounded-xl h-10 p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            Connections{" "}
            <span className="ml-1.5 text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded-md">
              {connections.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            Budget Rules{" "}
            <span className="ml-1.5 text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded-md">
              {rules.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            Alerts
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="border border-border rounded-2xl bg-card p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Spend Over Time</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Chart data coming soon
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-card p-5">
            <h3 className="font-semibold mb-4">Model Breakdown</h3>
            <div className="space-y-4">
              {modelBreakdown.map((m) => {
                const modelPct =
                  project.monthlySpend > 0
                    ? Math.round((m.spend / project.monthlySpend) * 100)
                    : 0;
                return (
                  <div key={m.model}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-mono font-semibold">{m.model}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{m.tokens} tokens</span>
                        <span className="font-mono font-semibold text-foreground">
                          ${m.spend.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${modelPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {modelPct}% of project spend
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections" className="mt-5">
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlugsConnected size={16} className="text-muted-foreground" />
                <h3 className="font-semibold text-sm">API Keys</h3>
              </div>
              <Link href="/connections">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 text-xs h-8"
                >
                  Manage All
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {connections.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No connections yet.
                </div>
              ) : (
                connections.map((conn) => {
                  const cs =
                    connStatusConfig[conn.status] ?? connStatusConfig.invalid;
                  const CsIcon = cs.icon;
                  const providerInitials = conn.provider
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={conn.id}
                      className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/2 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold font-mono text-muted-foreground">
                          {providerInitials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            ••••••••{conn.apiKeySuffix}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cs.bg} ${cs.color} ${cs.border}`}
                          >
                            <CsIcon size={9} weight="fill" />
                            {cs.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last polled {formatRelativeTime(conn.lastPolledAt)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          toast.info(
                            "To remove a connection, use the Connections page."
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* Budget Rules */}
        <TabsContent value="rules" className="mt-5 space-y-4">
          {!canCreateBudgetRules(userPlan) ? (
            <div className="relative">
              <div className="blur-sm pointer-events-none select-none space-y-3 opacity-60">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="border border-border rounded-2xl p-4 bg-card flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Bell size={16} className="text-yellow-400" weight="fill" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 bg-white/10 rounded" />
                      <div className="h-2.5 w-40 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 rounded-2xl backdrop-blur-sm">
                <p className="text-sm font-semibold mb-3">
                  Upgrade to Plus to create budget rules
                </p>
                <Link href="/settings/billing">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-4 text-sm font-semibold">
                    Upgrade to Plus
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Rules trigger within 5 minutes of threshold crossing.
                </p>
                <AddRuleDialog
                  project={project}
                  userPlan={userPlan}
                  onAdd={(r) => setRules((prev) => [...prev, r])}
                />
              </div>

              {rulesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="border border-border rounded-2xl p-4 bg-card"
                    >
                      <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : rules.length === 0 ? (
                <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Bell size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold mb-1">No rules yet.</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add your first budget rule to get alerts when spend crosses
                    a threshold.
                  </p>
                  <AddRuleDialog
                    project={project}
                    userPlan={userPlan}
                    onAdd={(r) => setRules((prev) => [...prev, r])}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => {
                    const ac = actionConfig[rule.action] ?? actionConfig.alert;
                    const ActionIcon = ac.icon;
                    const isConfirming = confirmDeleteId === rule.id;
                    const isDeleting = deletingId === rule.id;
                    return (
                      <div
                        key={rule.id}
                        className="border border-border rounded-2xl p-4 bg-card flex items-center gap-4 min-h-[64px]"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl ${ac.bg} flex items-center justify-center shrink-0`}
                        >
                          <ActionIcon
                            size={16}
                            className={ac.color}
                            weight="fill"
                          />
                        </div>
                        {isConfirming ? (
                          <div className="flex-1 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Delete this rule?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-8 px-3 border-border/40 text-xs"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="rounded-lg h-8 px-3 bg-destructive hover:bg-destructive/90 text-white text-xs"
                                onClick={() => handleDeleteRule(rule.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting…" : "Delete"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-semibold">
                                  {rule.action.charAt(0).toUpperCase() +
                                    rule.action.slice(1)}
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  when
                                </span>{" "}
                                <span className="font-mono font-semibold">
                                  {rule.budget_window} spend ≥{" "}
                                  {rule.threshold_pct}% of ${rule.limit_usd}
                                </span>
                              </p>
                            </div>
                            <button
                              onClick={() => setConfirmDeleteId(rule.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border border-dashed border-border/40 rounded-xl p-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span>{" "}
                Block and Throttle actions fire at the next poll cycle — up to
                5 minutes after the threshold is crossed.
              </div>
            </>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-5">
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Bell size={16} className="text-muted-foreground" />
              <h3 className="font-semibold text-sm">Alert History</h3>
            </div>
            <div className="divide-y divide-border">
              {alerts.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No alerts for this project yet.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="px-5 py-4 flex items-start gap-3 hover:bg-white/2 transition-colors"
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${
                        alert.severity === "critical"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : alert.severity === "warning"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.firedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${
                          alert.status === "active"
                            ? "text-destructive"
                            : "text-emerald-400"
                        }`}
                      >
                        {alert.status.charAt(0).toUpperCase() +
                          alert.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-5">
          <div className="border border-border rounded-2xl bg-card p-5 space-y-5">
            <div>
              <h3 className="font-semibold mb-1">Slack Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Paste an incoming webhook URL to receive budget alerts in Slack.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slack-webhook" className="text-sm font-medium">
                Slack Webhook URL
              </Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="font-mono text-sm rounded-xl border-border/60 bg-background h-10"
              />
              <p className="text-xs text-muted-foreground">
                Create an incoming webhook at{" "}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  api.slack.com/messaging/webhooks
                </a>
                . Leave blank to disable Slack alerts.
              </p>
            </div>
            <Button
              onClick={handleSaveSlackWebhook}
              disabled={slackSaving}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-6 font-semibold"
            >
              {slackSaving ? "Saving…" : "Save Webhook"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
