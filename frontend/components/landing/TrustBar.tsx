import { Lock } from "lucide-react"

const TRUST_ITEMS = [
  "AES-256 Encrypted",
  "GDPR Compliant",
  "Read-Only Key Access",
  "No Proxy Required",
]

export function TrustBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs font-medium text-muted-foreground ${className}`}
    >
      <Lock size={12} className="text-primary shrink-0" />
      {TRUST_ITEMS.map((item, i) => (
        <span key={item} className="flex items-center gap-3">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          {item}
        </span>
      ))}
    </div>
  )
}
