"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface BurnRateGaugeProps {
  spent: number;
  projected: number;
  dailyRate: number;
}

export function BurnRateGauge({ spent, projected, dailyRate }: BurnRateGaugeProps) {
  const total = Math.max(projected, spent, 0.01);
  const filled = Math.min(spent, total);
  const empty = total - filled;
  const pct = Math.round((spent / total) * 100);

  const data = [
    { value: filled },
    { value: empty },
  ];

  return (
    <div className="relative w-44 h-24 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="62%"
            outerRadius="85%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            isAnimationActive
          >
            <Cell fill="#FF500B" />
            <Cell fill="rgba(255,255,255,0.06)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p className="text-2xl font-bold font-mono leading-none">
          ${dailyRate.toFixed(2)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">/day · {pct}% used</p>
      </div>
    </div>
  );
}