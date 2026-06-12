import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Plus, Zap, TrendingUp } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { SpendChart } from "@/components/dashboard/SpendChart";
import { RangeToggle } from "@/components/dashboard/RangeToggle";
import { BurnRateGauge } from "@/components/dashboard/BurnRateGauge";
import { StatValue } from "@/components/dashboard/StatValue";
import { MagicCard } from "@/components/ui/magic/magic-card";
import {
  getDashboardStats,
  getDailySpend,
  getTopProjects,
  getRecentAlerts,
} from "@/lib/queries/dashboard";
import { getHistoryDays } from "@/lib/tier";

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
  let session: { id: string; email: string; backendToken: string | undefined };
  try {
    session = await requireSession();
  } catch {
    redirect("/login");
  }

  const token = session.backendToken;

  const userPlan = "free"; // plan comes from Express backend; default to free for display

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

  const [stats, spendData, topProjects, recentAlerts] = await Promise.all([
    getDashboardStats(session.id, token),
    getDailySpend(session.id, finalDays, token),
    getTopProjects(session.id, token),
    getRecentAlerts(session.id, 5, token),
  ]);

  // 7-day rolling burn rate
  const last7 = spendData.slice(-7);
  const last7Sum = last7.reduce((acc, row) => {
    return (
      acc +
      Object.entries(row)
        .filter(([k]) => k !== "date")
        .reduce((s, [, v]) => s + (typeof v === "number" ? v : 0), 0)
    );
  }, 0);
  const burnRateDaily = last7.length > 0 ? last7Sum / 7 : 0;
  const projectedMonthly = burnRateDaily * 30;

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hey {name} — AI spend for{" "}
            {new Date().toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/connections"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold glass-panel hover:border-white/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(255,80,11,0.35)]"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accent card */}
        <div className="card-lift relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#FF500B] to-[#b83b08] text-white shadow-[0_8px_32px_rgba(255,80,11,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),_transparent_65%)]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/65">
                Monthly Spend
              </p>
              <Link href="/projects">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
            <p className="text-4xl font-bold font-mono">
              $<StatValue value={stats.monthlySpend} decimalPlaces={2} />
            </p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <TrendingUp className="w-3 h-3 text-white/70" />
              <span className="text-[11px] text-white/70">
                Calendar month to date
              </span>
            </div>
          </div>
        </div>

        {/* Glass cards */}
        {(
          [
            {
              label: "Active Projects",
              value: stats.activeProjects,
              sub: `${stats.connectionCount} connection${stats.connectionCount !== 1 ? "s" : ""}`,
              href: "/projects",
            },
            {
              label: "API Connections",
              value: stats.connectionCount,
              sub: "Across all projects",
              href: "/connections",
            },
            {
              label: "Budget Alerts",
              value: stats.alertCount,
              sub: stats.alertCount > 0 ? "Needs attention" : "All clear",
              href: "/alerts",
              urgent: stats.alertCount > 0,
            },
          ] as const
        ).map((card) => (
          <MagicCard
            key={card.label}
            className="glass-panel card-lift rounded-3xl p-5 cursor-default"
            gradientColor="rgba(255,80,11,0.08)"
            gradientOpacity={0.6}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <Link href={card.href}>
                <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
            </div>
            <p
              className={`text-4xl font-bold font-mono ${"urgent" in card && card.urgent ? "text-destructive" : ""}`}
            >
              <StatValue value={card.value} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-2.5">
              {card.sub}
            </p>
          </MagicCard>
        ))}
      </div>

      {/* ── Middle row: Spend chart + Top Projects ────────── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Chart — 3/5 */}
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

        {/* Top Projects — 2/5 */}
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
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No project spend yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {topProjects.map((p) => {
                const pct =
                  p.budgetLimit !== null
                    ? Math.min(
                        100,
                        Math.round((p.monthlySpend / p.budgetLimit) * 100),
                      )
                    : null;
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold group-hover:text-primary transition-colors truncate max-w-[120px]">
                        {p.name}
                      </span>
                      <span className="font-mono text-xs font-semibold shrink-0">
                        ${p.monthlySpend.toFixed(2)}
                        {p.budgetLimit !== null && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            / ${p.budgetLimit}
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

      {/* ── Bottom row: Alerts + Burn Rate ───────────────── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Alerts — 3/5 */}
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
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No alerts yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Fires when a budget threshold is crossed.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider border shrink-0 mt-0.5 ${severityStyles[a.severity] ?? severityStyles.info}`}
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

        {/* Burn Rate — 2/5 */}
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

          {/* Breakdown */}
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

      {/* ── CTA (no connections) ─────────────────────────── */}
      {stats.connectionCount === 0 && (
        <div className="glass-panel cta-gradient rounded-3xl p-8 flex items-center gap-5 border-primary/25 shadow-[0_0_40px_rgba(255,80,11,0.08)]">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Connect your first API key</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add a provider connection to start tracking real spend.
            </p>
            <Link
              href="/connections"
              className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Get started →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
