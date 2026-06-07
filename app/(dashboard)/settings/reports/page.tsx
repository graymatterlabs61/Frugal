"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart3, Download, FileText } from "lucide-react";

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        checked ? "bg-primary" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ReportsPage() {
  const [monthly, setMonthly] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [alertFrequency, setAlertFrequency] = useState(false);

  const reportToggles = [
    {
      label: "Monthly spend summary",
      sub: "Email on 1st of each month",
      value: monthly,
      set: setMonthly,
    },
    {
      label: "Weekly digest",
      sub: "Email every Monday morning",
      value: weekly,
      set: setWeekly,
    },
    {
      label: "Alert frequency report",
      sub: "Monthly summary of triggered rules",
      value: alertFrequency,
      set: setAlertFrequency,
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
          {reportToggles.map(({ label, sub, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <Toggle
                checked={value}
                onChange={() => {
                  set(!value);
                  toast.info("Coming soon");
                }}
              />
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
                className="rounded-xl h-8 px-3 text-xs border-white/[0.1] shrink-0 gap-1.5"
                onClick={() => toast.info("Export — coming soon")}
              >
                <Download className="w-3 h-3" />
                Export
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
