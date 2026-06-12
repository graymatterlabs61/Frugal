import { Bell, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getRecentAlerts, type RecentAlert } from "@/lib/queries/dashboard";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

const severityStyles = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  info: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
};

const statusStyles = {
  active: "text-destructive",
  resolved: "text-emerald-500",
  acknowledged: "text-muted-foreground",
};

const statusIcons = {
  active: ShieldAlert,
  resolved: CheckCircle2,
  acknowledged: Clock,
};

function formatAlertTime(firedAt: string): string {
  return new Date(firedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AlertsPage() {
  const session = await requireSession();

  const hdrs = await headers();
  const cookieHeader = hdrs.get("cookie") ?? "";
  const jwt = await getToken({
    req: { headers: { cookie: cookieHeader } } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET!,
  });
  const token = jwt?.sub ? (jwt as { accessToken?: string }).accessToken ?? undefined : undefined;

  const alerts = await getRecentAlerts(session.id, 100, token);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Budget thresholds, spend spikes, and limit breaches.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel card-lift rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Active
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20">
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-destructive">
            {activeCount}
          </p>
        </div>
        <div className="glass-panel card-lift rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Critical
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Bell className="w-4 h-4 text-yellow-500" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-destructive">
            {criticalCount}
          </p>
        </div>
        <div className="glass-panel card-lift rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Resolved
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-500">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Alerts table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Alert History</h3>
        </div>
        {alerts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Alerts fire when a budget rule threshold is crossed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert: RecentAlert) => {
              const StatusIcon = statusIcons[alert.status];
              return (
                <div
                  key={alert.id}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-white/2 transition-colors"
                >
                  <StatusIcon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${statusStyles[alert.status]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm font-mono">
                        {alert.type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${severityStyles[alert.severity]}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatAlertTime(alert.firedAt)}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-0.5 ${statusStyles[alert.status]}`}
                    >
                      {alert.status.charAt(0).toUpperCase() +
                        alert.status.slice(1)}
                    </p>
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
