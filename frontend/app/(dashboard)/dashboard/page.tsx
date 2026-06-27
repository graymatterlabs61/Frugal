import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Plus,
  Zap,
  TrendingUp,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Plug,
} from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { SpendChart } from "@/components/dashboard/SpendChart";
import { RangeToggle } from "@/components/dashboard/RangeToggle";
import { BurnRateGauge } from "@/components/dashboard/BurnRateGauge";
import { StatValue } from "@/components/dashboard/StatValue";
import {
  getDashboardSummary,
  getSpendChart,
  getTopProjects,
  getRecentAlerts,
  getProjects,
  getConnections,
} from "@/lib/queries/dashboard";
import { getHistoryDays } from "@/lib/tier";
import { ExitPopup } from "@/components/landing/ExitPopup";

const severityStyles: Record<string, string> = {
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  critical: "bg-red-500/15 text-red-400 border-red-500/25",
  info: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const VALID_DAYS = [7, 30, 90] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  let session: { id: string; email: string; name: string | null; plan: string };
  try {
    session = await requireSession();
  } catch {
    redirect("/login");
  }

  const token = undefined;
  const userPlan = session.plan ?? "free";

  const params = await searchParams;
  const rawDays = Number(params?.days ?? "7");
  const days: 7 | 30 | 90 = (VALID_DAYS as readonly number[]).includes(rawDays)
    ? (rawDays as 7 | 30 | 90)
    : 7;

  const historyMax = getHistoryDays(userPlan);
  const validOptions: (7 | 30 | 90)[] = [7, 30, 90];
  const effectiveDays: 7 | 30 | 90 = validOptions.filter((d) => d <= historyMax).pop() ?? 7;
  const finalDays: 7 | 30 | 90 = days <= historyMax ? days : effectiveDays;

  const name = session.email.split("@")[0] ?? "there";

  const [summary, spendData, topProjects, allAlerts, allProjects, allConnections] =
    await Promise.all([
      getDashboardSummary(token),
      getSpendChart(finalDays, token),
      getTopProjects(finalDays, token),
      getRecentAlerts(100, token),
      getProjects(token),
      getConnections(token),
    ]);

  const recentAlerts = allAlerts.slice(0, 5);

  const stats = {
    monthlySpend: summary.totalSpendThisMonth,
    activeProjects: allProjects.length,
    connectionCount: allConnections.length,
    alertCount: allAlerts.filter((a) => a.status === "active").length,
  };

  const last7 = spendData.slice(-7);
  const last7Sum = last7.reduce((acc, row) => acc + row.costUsd, 0);
  const burnRateDaily = last7.length > 0 ? last7Sum / 7 : 0;
  const projectedMonthly = burnRateDaily * 30;

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPct = Math.round((dayOfMonth / daysInMonth) * 100);

  return (
    <div className="space-y-5">
      {/* ── Greeting ─────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h1 className="text-2xl font-bold tracking-tight leading-snug">
            {name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
            <span className="mx-2 text-muted-foreground/30">·</span>
            <span className="font-mono">{monthPct}%</span> of month elapsed
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pb-0.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(255,80,11,0.30)]"
          >
            <Plus className="w-4 h-4" />
            New project
          </Link>
        </div>
      </div>

      {/* ── Stats: asymmetric 3-column layout ───────────── */}
      <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-4 animate-fade-in-up stagger-1">

        {/* Primary: Monthly Spend */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#FF500B] to-[#b83b08] text-white shadow-[0_8px_40px_rgba(255,80,11,0.28)] card-lift">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_65%)]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                Monthly Spend
              </p>
              <Link href="/projects">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
            <p className="text-5xl font-bold font-mono leading-none">
              $<StatValue value={stats.monthlySpend} decimalPlaces={2} />
            </p>
            <div className="mt-5 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-white/60">Projected at current rate</span>
                <span className="font-mono font-semibold">
                  ${projectedMonthly.toFixed(2)}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/70"
                  style={{ width: `${Math.min(100, monthPct)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {dayOfMonth} of {daysInMonth} days
              </p>
            </div>
          </div>
        </div>

        {/* Secondary: Projects + Connections stacked */}
        <div className="flex flex-col gap-4">
          <Link href="/projects" className="flex-1 glass-panel card-lift rounded-3xl p-5 flex items-center gap-4 hover:border-white/20 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
              <FolderOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">
                Active Projects
              </p>
              <p className="text-3xl font-bold font-mono leading-none">
                <StatValue value={stats.activeProjects} />
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
          </Link>

          <Link href="/projects" className="flex-1 glass-panel card-lift rounded-3xl p-5 flex items-center gap-4 hover:border-white/20 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
              <Plug className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">
                API Connections
              </p>
              <p className="text-3xl font-bold font-mono leading-none">
                <StatValue value={stats.connectionCount} />
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
          </Link>
        </div>

        {/* Alert status: conditional styling */}
        <Link
          href="/alerts"
          className={`relative overflow-hidden glass-panel card-lift rounded-3xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group ${
            stats.alertCount > 0 ? "ring-1 ring-destructive/30 border-destructive/20" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Budget Alerts
            </p>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                stats.alertCount > 0
                  ? "bg-destructive/10"
                  : "bg-emerald-500/10"
              }`}
            >
              <ArrowUpRight
                className={`w-3.5 h-3.5 ${
                  stats.alertCount > 0 ? "text-destructive/70" : "text-emerald-500/70"
                }`}
              />
            </div>
          </div>

          <div className="mt-auto">
            <p
              className={`text-5xl font-bold font-mono leading-none ${
                stats.alertCount > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              <StatValue value={stats.alertCount} />
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              {stats.alertCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive/70" />
                  <span className="text-xs text-destructive/80 font-medium">
                    {stats.alertCount} need{stats.alertCount === 1 ? "s" : ""} attention
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                  <span className="text-xs text-emerald-500/80 font-medium">
                    All clear
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* ── Chart + Top Projects ──────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4 animate-fade-in-up stagger-2">
        <div className="lg:col-span-3 glass-panel card-hover-tint rounded-3xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Spend Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last {days} days · all providers
              </p>
            </div>
            <Suspense fallback={null}>
              <RangeToggle />
            </Suspense>
          </div>
          <SpendChart data={spendData} days={days} />
        </div>

        <div className="lg:col-span-2 glass-panel card-hover-tint rounded-3xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Top Projects</h3>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-border hover:border-white/25 hover:bg-white/5 transition-all"
            >
              <Plus className="w-3 h-3" />
              New
            </Link>
          </div>

          {topProjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">No spend yet</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[200px]">
                  Create a project and connect an API key to start tracking.
                </p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-primary font-semibold hover:underline mt-1"
              >
                Create project →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {topProjects.map((p) => {
                const pct =
                  p.budgetLimit !== null
                    ? Math.min(100, Math.round((p.monthlySpend / p.budgetLimit) * 100))
                    : null;
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold group-hover:text-primary transition-colors truncate max-w-[120px] font-mono">
                        {p.name}
                      </span>
                      <span className="font-mono text-xs font-semibold shrink-0">
                        ${p.monthlySpend.toFixed(2)}
                        {p.budgetLimit !== null && (
                          <span className="text-muted-foreground font-normal">
                            {" "}/ ${p.budgetLimit}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct !== null && pct >= 100
                            ? "bg-destructive"
                            : pct !== null && pct >= 80
                              ? "bg-yellow-500"
                              : "bg-primary"
                        }`}
                        style={{ width: pct !== null ? `${pct}%` : "0%" }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {pct !== null ? `${pct}% of budget` : "No budget set"}
                    </p>
                  </Link>
                );
              })}

              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-auto"
              >
                View all projects <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Alerts + Burn Rate ─────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4 animate-fade-in-up stagger-3">
        <div className="lg:col-span-3 glass-panel card-hover-tint rounded-3xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Recent Alerts</h3>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">All clear</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fires when a budget threshold is crossed.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider border shrink-0 mt-0.5 ${
                      severityStyles[a.severity] ?? severityStyles.info
                    }`}
                  >
                    {a.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.type}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {a.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(a.firedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-panel card-hover-tint rounded-3xl p-5 flex flex-col">
          <h3 className="font-semibold mb-4">Burn Rate</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <BurnRateGauge
              spent={stats.monthlySpend}
              projected={projectedMonthly}
              dailyRate={burnRateDaily}
            />
            <p className="text-xs text-muted-foreground mt-3">
              7-day rolling average
            </p>
          </div>
          <div className="space-y-2.5 pt-4 border-t border-white/6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This month</span>
              <span className="font-mono font-semibold">
                ${stats.monthlySpend.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected</span>
              <span className="font-mono font-semibold">
                ${projectedMonthly.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-mono font-semibold">
                {stats.activeProjects}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA (no projects) ────────────────────────────── */}
      {stats.activeProjects === 0 && (
        <div className="glass-panel cta-gradient rounded-3xl p-8 flex items-center gap-5 border-primary/25 shadow-[0_0_40px_rgba(255,80,11,0.08)] animate-fade-in-up stagger-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Create your first project</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Projects group your API connections and let you set budget rules per app.
            </p>
            <Link
              href="/projects"
              className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Get started →
            </Link>
          </div>
        </div>
      )}
      <ExitPopup />
    </div>
  );
}