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

  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);
  if (total === 0) return null;

  const formatted = label
    ? new Date(label + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : label;

  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl min-w-[120px]">
      <p className="text-xs text-muted-foreground mb-1.5">{formatted}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Spend</span>
        <span className="font-mono font-bold">${total.toFixed(4)}</span>
      </div>
    </div>
  );
}

export function SpendChart({ data, days: _days }: SpendChartProps) {
  const hasData = data.length > 0 && data.some((row) => row.costUsd > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        No spend data yet
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
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
        <Bar
          dataKey="costUsd"
          stackId="spend"
          fill="#FF500B"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
