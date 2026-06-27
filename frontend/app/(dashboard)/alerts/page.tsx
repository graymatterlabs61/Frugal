import { Bell, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getRecentAlerts, type RecentAlert } from "@/lib/queries/dashboard";

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
  const token = undefined;

  const alerts = await getRecentAlerts(100, token);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <p className="section-eyebrow">Monitoring</p>
        <h2 className="text-2xl font-bold">Alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Budget thresholds, spend spikes, and limit breaches.
        </p>
      </div>

      {/* Status bar */}
      <div className="glass-panel rounded-2xl animate-fade-in-up stagger-1 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
          <div className="px-6 py-5 flex items-center gap-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 shrink-0">
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </span>
            <div>
              <p className="text-2xl font-bold font-mono leading-none text-destructive">
                {activeCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                Active
              </p>
            </div>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
              <Bell className="w-4 h-4 text-yellow-500" />
            </span>
            <div>
              <p className="text-2xl font-bold font-mono leading-none">
                {criticalCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                Critical
              </p>
            </div>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </span>
            <div>
              <p className="text-2xl font-bold font-mono leading-none text-emerald-500">
                {resolvedCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                Resolved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts table */}
      <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in-up stagger-2">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Alert History</h3>
        </div>
        {alerts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] mx-auto leading-relaxed">
              No alerts triggered yet. Budget rules fire here when a threshold is crossed.
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
