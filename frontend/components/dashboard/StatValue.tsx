"use client"

import { NumberTicker } from "@/components/ui/magic/number-ticker"

interface StatValueProps {
  value: number
  prefix?: string
  decimalPlaces?: number
  className?: string
}

export function StatValue({ value, prefix, decimalPlaces = 0, className }: StatValueProps) {
  return (
    <span className={className}>
      {prefix}
      <NumberTicker value={value} decimalPlaces={decimalPlaces} className={className} />
    </span>
  )
}
