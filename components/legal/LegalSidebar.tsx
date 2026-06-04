"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type LegalSectionItem = {
  id: string
  title: string
}

const NAVIGATION = [
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
]

const COMPANY_NAVIGATION = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

type SidebarProps = {
  sections?: LegalSectionItem[]
  variant?: "legal" | "company"
}

export function LegalSidebar({ sections, variant = "legal" }: SidebarProps) {
  const pathname = usePathname()

  const navLabel = variant === "company" ? "Company" : "Legal Center"
  const navItems = variant === "company" ? COMPANY_NAVIGATION : NAVIGATION
  const logoSub = variant === "company" ? "Gray Matter Labs" : "Legal Provider"

  return (
    <aside className="sticky top-16 flex h-fit w-full flex-col gap-10 md:w-64 shrink-0">
      <Link href="/" className="flex items-center gap-3 mb-2">
        <img src="/logo.svg" alt="Frugal" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_#FF500B66]" />
        <div className="flex flex-col">
          <span className="font-ethnocentric text-base font-bold tracking-tight leading-none text-foreground">Frugal</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-0.5">{logoSub}</span>
        </div>
      </Link>

      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          {navLabel}
        </h3>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex h-4 w-4 items-center justify-center shrink-0">
                  {isActive ? (
                    <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
                    </div>
                  ) : (
                    <svg className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                  )}
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {sections && sections.length > 0 && (
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-3 px-3">
            {sections.map((section, idx) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-muted-foreground/40 text-xs font-mono group-hover:text-primary transition-colors mt-0.5">
                    {idx + 1}.
                  </span>
                  <span className="leading-snug">{section.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-sm">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h4 className="mb-1.5 text-sm font-semibold text-foreground">Need clarification?</h4>
        <p className="mb-5 text-xs leading-relaxed text-muted-foreground text-balance">
          Our legal team is available to help explain any terms.
        </p>
        <a
          href="mailto:legal@frugal.so"
          className="flex w-full items-center justify-center rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
        >
          Contact Legal
        </a>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
          Compliance
        </h3>
        <ul className="flex flex-col gap-3 px-1 text-xs font-medium text-muted-foreground/70">
          <li className="flex items-center gap-3">
            <svg className="h-3.5 w-3.5 text-emerald-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            GDPR Compliant
          </li>
          <li className="flex items-center gap-3">
            <svg className="h-3.5 w-3.5 text-emerald-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            SOC 2 Type II
          </li>
          <li className="flex items-center gap-3">
            <svg className="h-3.5 w-3.5 text-emerald-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Privacy Shield
          </li>
        </ul>
      </div>
    </aside>
  )
}
