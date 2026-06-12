"use client";

import { useState } from "react";
import { SlidersHorizontal, Monitor } from "lucide-react";

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

const selectClass =
  "bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 h-9 text-sm text-foreground shrink-0 outline-none focus:border-primary/50 transition-colors";

export default function PreferencesPage() {
  const [burnRate, setBurnRate] = useState(true);
  const [lastPolled, setLastPolled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Display settings */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Display</h3>
        </div>
        <div className="p-5 space-y-5">
          {(
            [
              {
                label: "Default dashboard view",
                hint: "What shows first when you open the dashboard",
                options: ["Overview", "Projects", "Alerts"],
              },
              {
                label: "Currency",
                hint: "Currency for spend display",
                options: ["USD ($)", "EUR (€)", "GBP (£)"],
              },
              {
                label: "Date format",
                hint: "How dates are displayed across the app",
                options: ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
              },
            ] as const
          ).map(({ label, hint, options }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              </div>
              <select className={selectClass}>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard defaults */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Dashboard Defaults</h3>
        </div>
        <div className="p-5 space-y-5">
          {(
            [
              {
                label: "Show burn rate on overview",
                sub: "Displays projected monthly spend",
                value: burnRate,
                set: setBurnRate,
              },
              {
                label: "Show last-polled timestamp",
                sub: "Shown on each provider card",
                value: lastPolled,
                set: setLastPolled,
              },
              {
                label: "Compact card mode",
                sub: "Smaller provider cards for higher density",
                value: compactMode,
                set: setCompactMode,
              },
            ] as const
          ).map(({ label, sub, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <Toggle checked={value} onChange={set} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
