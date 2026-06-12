"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Download, FileText } from "lucide-react";

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

function SoonBadge() {
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground/60 rounded px-1.5 py-0.5 shrink-0">
      Soon
    </span>
  );
}

export default function ReportsPage() {
  const reportToggles = [
    {
      label: "Monthly spend summary",
      sub: "Email on 1st of each month",
    },
    {
      label: "Weekly digest",
      sub: "Email every Monday morning",
    },
    {
      label: "Alert frequency report",
      sub: "Monthly summary of triggered rules",
    },
  ] as const;

  const exports = [
    {
      label: "Export usage records (CSV)",
      desc: "All usage_records rows for your account",
    },
    {
      label: "Export alert log (CSV)",
      desc: "Full alert history with delivery status",
    },
    {
      label: "Export billing history (CSV)",
      desc: "Invoice and payment records",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Usage reports */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Usage Reports</h3>
        </div>
        <div className="p-5 space-y-5">
          {reportToggles.map(({ label, sub }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>
              </div>
              <SoonBadge />
            </div>
          ))}
        </div>
      </div>

      {/* Data export */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Data Export</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {exports.map(({ label, desc }) => (
            <div
              key={label}
              className="px-5 py-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="rounded-xl h-8 px-3 text-xs border-white/[0.1] shrink-0 gap-1.5"
              >
                <Download className="w-3 h-3" />
                Export · Soon
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
