"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SpendRow } from "@/lib/queries/dashboard";

const PROVIDER_COLORS: Record<string, string> = {
  openai:    "#10a37f",
  anthropic: "#d97706",
  replicate: "#ea2805",
  falai:     "#ec0648",
  gemini:    "#4285f4",
  groq:      "#f55036",
  mistral:   "#fa520f",
};

const PROVIDERS = Object.keys(PROVIDER_COLORS);

interface SpendChartProps {
  data: SpendRow[];
  days: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const nonZero = payload.filter((p) => p.value > 0);
  if (nonZero.length === 0) return null;

  const total = nonZero.reduce((sum, p) => sum + p.value, 0);

  // Format date label
  const formatted = label
    ? new Date(label + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : label;

  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl min-w-[140px]">
      <p className="text-xs text-muted-foreground mb-1.5">{formatted}</p>
      {nonZero.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs mb-0.5">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="capitalize">{p.dataKey}</span>
          </span>
          <span className="font-mono font-medium">${p.value.toFixed(4)}</span>
        </div>
      ))}
      <div className="border-t border-border/50 mt-1.5 pt-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono font-bold">${total.toFixed(4)}</span>
      </div>
    </div>
  );
}

export function SpendChart({ data, days: _days }: SpendChartProps) {
  // Empty state: no data or all zeroes
  const hasData =
    data.length > 0 &&
    data.some((row) =>
      PROVIDERS.some((p) => typeof row[p] === "number" && (row[p] as number) > 0),
    );

  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        No spend data yet
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: string) =>
            new Date(value + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        {PROVIDERS.map((provider, index) => {
          const isLast = index === PROVIDERS.length - 1;
          return (
            <Bar
              key={provider}
              dataKey={provider}
              stackId="spend"
              fill={PROVIDER_COLORS[provider]}
              radius={isLast ? [2, 2, 0, 0] : [0, 0, 0, 0]}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}
