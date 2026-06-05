"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

const RANGES = [
  { label: "7d",  value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

export function RangeToggle() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = Number(searchParams.get("days") ?? "7");

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
      {RANGES.map(({ label, value }) => {
        const isActive = current === value;
        return (
          <Link
            key={value}
            href={`${pathname}?days=${value}`}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-card text-foreground border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
