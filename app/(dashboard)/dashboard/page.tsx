import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, FolderOpen, Bell, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SpendChart } from "@/components/dashboard/SpendChart";
import { RangeToggle } from "@/components/dashboard/RangeToggle";
import {
  getDashboardStats,
  getDailySpend,
  getTopProjects,
  getRecentAlerts,
} from "@/lib/queries/dashboard";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down" | "neutral";
  urgent?: boolean;
}

function StatCard({ label, value, sub, trend, urgent }: StatCardProps) {
  return (
    <div className="border border-border rounded-2xl p-5 bg-card">
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </p>
      <p
        className={`text-3xl font-bold font-mono mb-1 ${urgent ? "text-destructive" : ""}`}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
        {trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

const severityStyles = {
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const rawDays = Number(params?.days ?? "7");
  const days: 7 | 30 | 90 = (VALID_DAYS as readonly number[]).includes(rawDays)
    ? (rawDays as 7 | 30 | 90)
    : 7;

  const name =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    "there";

  const [stats, spendData, topProjects, recentAlerts] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getDailySpend(supabase, user.id, days),
    getTopProjects(supabase, user.id),
    getRecentAlerts(supabase, user.id, 5),
  ]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold">Good to see you, {name} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your AI API cost overview for{" "}
          {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Spend"
          value={`$${stats.monthlySpend.toFixed(2)}`}
          sub="Calendar month to date"
          trend="neutral"
        />
        <StatCard
          label="Active Projects"
          value={String(stats.activeProjects)}
          sub={`${stats.connectionCount} connection${stats.connectionCount !== 1 ? "s" : ""} total`}
          trend="neutral"
        />
        <StatCard
          label="API Connections"
          value={String(stats.connectionCount)}
          sub="Across all projects"
          trend="neutral"
        />
        <StatCard
          label="Budget Alerts"
          value={String(stats.alertCount)}
          sub="This month"
          urgent={stats.alertCount > 0}
        />
      </div>

      {/* Spend chart */}
      <div className="border border-border rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Spend Over Time</h3>
            <p className="text-sm text-muted-foreground">
              Last {days} days · All providers
            </p>
          </div>
          <Suspense fallback={null}>
            <RangeToggle />
          </Suspense>
        </div>
        <SpendChart data={spendData} days={days} />
      </div>

      {/* Bottom two columns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top projects */}
        <div className="border border-border rounded-2xl bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Projects</h3>
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              View all
            </Link>
          </div>
          {topProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No project spend yet.
            </p>
          ) : (
            <div className="space-y-4">
              {topProjects.map((p) => {
                const pct =
                  p.budgetLimit !== null
                    ? Math.round((p.monthlySpend / p.budgetLimit) * 100)
                    : null;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {p.name}
                      </Link>
                      <span className="font-mono font-semibold">
                        ${p.monthlySpend.toFixed(2)}
                        {p.budgetLimit !== null && (
                          <span className="text-muted-foreground font-normal">
                            {" "}/ ${p.budgetLimit}
                          </span>
                        )}
                      </span>
                    </div>
                    {pct !== null ? (
                      <>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-yellow-500" : "bg-primary"}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pct}% of budget used
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        No budget set
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="border border-border rounded-2xl bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Alerts</h3>
            <Link
              href="/alerts"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              View all
            </Link>
          </div>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No alerts yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-white/2"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border shrink-0 mt-0.5 ${severityStyles[a.severity]}`}
                  >
                    {a.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.type}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
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
      </div>

      {/* CTA — shown only when no connections exist */}
      {stats.connectionCount === 0 && (
        <div className="border border-dashed border-primary/30 rounded-2xl p-8 flex items-center gap-5 bg-primary/5">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Connect your first API key</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Go to Projects → New Project to start tracking real spend data.
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
    </div>
  );
}