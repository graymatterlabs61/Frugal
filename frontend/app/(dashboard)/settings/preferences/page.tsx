"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-white/10"
        }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"
          }`}
      />
    </button>
  );
}

const selectClass =
  "bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 h-9 text-sm text-foreground shrink-0 outline-none focus:border-primary/50 transition-colors";

const STORAGE_KEY = "frugal:preferences";

interface Prefs {
  defaultView: string;
  currency: string;
  dateFormat: string;
  burnRate: boolean;
  lastPolled: boolean;
  compactMode: boolean;
}

const DEFAULTS: Prefs = {
  defaultView: "Overview",
  currency: "USD ($)",
  dateFormat: "MMM D, YYYY",
  burnRate: true,
  lastPolled: true,
  compactMode: false,
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);
  }, []);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast.success("Preferences saved");
  };

  if (!loaded) return null;

  return (
    <div className="w-full space-y-5">
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
                key: "defaultView",
                options: ["Overview", "Projects", "Alerts"],
              },
              {
                label: "Currency",
                hint: "Currency for spend display",
                key: "currency",
                options: ["USD ($)", "EUR (€)", "GBP (£)"],
              },
              {
                label: "Date format",
                hint: "How dates are displayed across the app",
                key: "dateFormat",
                options: ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
              },
            ] as const
          ).map(({ label, hint, key, options }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              </div>
              <select
                className={selectClass}
                value={prefs[key]}
                onChange={(e) => set(key, e.target.value)}
              >
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
                key: "burnRate",
              },
              {
                label: "Show last-polled timestamp",
                sub: "Shown on each provider card",
                key: "lastPolled",
              },
              {
                label: "Compact card mode",
                sub: "Smaller provider cards for higher density",
                key: "compactMode",
              },
            ] as const
          ).map(({ label, sub, key }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <Toggle
                checked={prefs[key]}
                onChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-5 text-sm font-semibold"
        >
          Save preferences
        </Button>
      </div>
    </div>
  );
}