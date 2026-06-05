"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash,
  Bell,
  PlugsConnected,
  ShieldWarning,
  CheckCircle,
  Warning,
  XCircle,
  Lock,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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
}

interface BudgetRule {
  id: string;
  limitUsd: number;
  window: "daily" | "monthly";
  action: "alert" | "block" | "throttle";
  thresholdPct: number;
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
    icon: Lock,
  },
  throttle: {
    label: "Throttle",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: ShieldWarning,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a last_polled_at ISO timestamp as relative time. */
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

/** Map DB project status to display status key. */
function mapStatus(dbStatus: string): "healthy" | "warning" | "critical" {
  if (dbStatus === "warning") return "warning";
  if (dbStatus === "critical") return "critical";
  return "healthy"; // 'active' and anything else → healthy
}

// ---------------------------------------------------------------------------
// AddRuleDialog (Budget Rules tab — mock, Phase 4)
// ---------------------------------------------------------------------------

function AddRuleDialog({ onAdd }: { onAdd: (r: BudgetRule) => void }) {
  const [open, setOpen] = useState(false);
  const [limitUsd, setLimitUsd] = useState("");
  const [ruleWindow, setRuleWindow] = useState<"daily" | "monthly">("monthly");
  const [action, setAction] = useState<"alert" | "block" | "throttle">("alert");
  const [thresholdPct, setThresholdPct] = useState("80");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitUsd);
    if (!limitUsd || isNaN(limit) || limit <= 0) {
      toast.error("Enter a valid budget limit");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onAdd({
      id: Date.now().toString(),
      limitUsd: limit,
      window: ruleWindow,
      action,
      thresholdPct: parseInt(thresholdPct),
    });
    toast.success("Budget rule created");
    setOpen(false);
    setLimitUsd("");
    setLoading(false);
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Budget Limit ($)
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
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Trigger At
              </label>
              <Select value={thresholdPct} onValueChange={setThresholdPct}>
                <SelectTrigger className="bg-input/30 border-border/40 h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {["60", "70", "80", "90", "100"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}% of limit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Window
            </label>
            <Select
              value={ruleWindow}
              onValueChange={(v) => setRuleWindow(v as "daily" | "monthly")}
            >
              <SelectTrigger className="bg-input/30 border-border/40 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="daily">
                  Daily — resets midnight UTC
                </SelectItem>
                <SelectItem value="monthly">
                  Monthly — resets 1st of month
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Action
            </label>
            <Select
              value={action}
              onValueChange={(v) =>
                setAction(v as "alert" | "block" | "throttle")
              }
            >
              <SelectTrigger className="bg-input/30 border-border/40 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="alert">
                  Alert — send notification, polling continues
                </SelectItem>
                <SelectItem value="block">
                  Block — flag connection, skip at next poll
                </SelectItem>
                <SelectItem value="throttle">
                  Throttle — downgrade model (Pro only)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
}: ProjectDetailClientProps) {
  const [rules, setRules] = useState<BudgetRule[]>([]);

  // Derive display values from real data
  const displayStatus = mapStatus(project.status);
  const statusStyle =
    statusStyles[displayStatus] ?? statusStyles.healthy;

  // Budget Used card
  const hasBudget = project.budgetLimit !== null;
  const budgetPct = hasBudget
    ? Math.round((project.monthlySpend / project.budgetLimit!) * 100)
    : null;

  // Days until limit (shown if < 14 days away)
  let daysUntilLimit: number | null = null;
  if (
    hasBudget &&
    project.burnRateDaily > 0 &&
    project.budgetLimit !== null
  ) {
    const remaining = (project.budgetLimit - project.monthlySpend) / project.burnRateDaily;
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
          {/* Connection count badge instead of single provider (project can have multiple) */}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md shrink-0 bg-white/5 text-muted-foreground">
            {connections.length} connection
            {connections.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Summary stat cards — real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spend This Month */}
        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Spend This Month
          </p>
          <p className="text-2xl font-bold font-mono">
            ${project.monthlySpend.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            of{" "}
            {hasBudget
              ? `$${project.budgetLimit} budget`
              : "No budget set"}
          </p>
        </div>

        {/* Budget Used */}
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

        {/* Burn Rate */}
        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Burn Rate
          </p>
          <p className="text-2xl font-bold font-mono">
            ${project.burnRateDaily.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per day avg</p>
        </div>

        {/* Projected / Month */}
        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Projected / Month
          </p>
          <p
            className={`text-2xl font-bold font-mono ${
              hasBudget && project.projectedMonthly > (project.budgetLimit ?? Infinity)
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
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="border border-border rounded-2xl bg-card p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Spend Over Time</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            {/* TODO Phase 3 follow-up: project-scoped chart data */}
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Chart data coming soon
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-card p-5">
            <h3 className="font-semibold mb-4">Model Breakdown</h3>
            {/* Mock data — Phase 4 */}
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

        {/* Connections — real data */}
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
                    connStatusConfig[conn.status] ??
                    connStatusConfig.invalid;
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
                          Last polled{" "}
                          {formatRelativeTime(conn.lastPolledAt)}
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

        {/* Budget Rules — mock, Phase 4 */}
        <TabsContent value="rules" className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Rules trigger within 5 minutes of threshold crossing.
            </p>
            <AddRuleDialog onAdd={(r) => setRules((prev) => [...prev, r])} />
          </div>

          {rules.length === 0 ? (
            <div className="border border-dashed border-border/50 rounded-2xl p-10 text-center">
              <p className="text-muted-foreground text-sm">
                No budget rules yet.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add a rule to auto-alert or block when spend exceeds a
                threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const ac = actionConfig[rule.action] ?? actionConfig.alert;
                const ActionIcon = ac.icon;
                return (
                  <div
                    key={rule.id}
                    className="border border-border rounded-2xl p-4 bg-card flex items-center gap-4 group"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${ac.bg} ${ac.color} ${ac.border}`}
                        >
                          {ac.label}
                        </span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md font-mono">
                          {rule.window}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="font-semibold">
                          {rule.action.charAt(0).toUpperCase() +
                            rule.action.slice(1)}
                        </span>{" "}
                        <span className="text-muted-foreground">when</span>{" "}
                        <span className="font-mono font-semibold">
                          {rule.window} spend ≥ {rule.thresholdPct}% of $
                          {rule.limitUsd}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setRules((prev) =>
                          prev.filter((r) => r.id !== rule.id)
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border border-dashed border-border/40 rounded-xl p-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> Block
            and Throttle actions fire at the next poll cycle — up to 5 minutes
            after the threshold is crossed. Use provider-native spending limits
            as a hard floor.
          </div>
        </TabsContent>

        {/* Alerts — real data */}
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
      </Tabs>
    </div>
  );
}
