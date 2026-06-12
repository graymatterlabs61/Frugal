import React from "react"
import { LegalSidebar, type LegalSectionItem } from "./LegalSidebar"
import { MarketingNav } from "@/components/landing/MarketingNav"

// ── Layout shell ─────────────────────────────────────────────

type LegalLayoutProps = {
  title: React.ReactNode
  subtitle?: React.ReactNode
  dateLabel?: string
  sections?: LegalSectionItem[]
  variant?: "legal" | "company"
  children: React.ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  dateLabel = "UPDATE MAR. 2024",
  sections,
  variant = "legal",
  children,
}: LegalLayoutProps) {
  return (
    <>
    <MarketingNav />
    <div className="min-h-screen bg-background text-foreground flex justify-center pt-24 pb-12 md:pb-20 px-6 md:px-12">
      <div className="flex flex-col md:flex-row gap-12 md:gap-24 w-full max-w-[1300px]">
        <LegalSidebar sections={sections} variant={variant} />
        
        <main className="flex-1 min-w-0 flex justify-center md:justify-start">
          <div className="w-full max-w-[850px] rounded-[2.5rem] bg-gradient-to-b from-[#170c08] to-[#0e0705] border border-[#2e1c13] p-8 md:p-16 lg:p-24 shadow-[0_32px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden">
            {/* Ambient orbs */}
            <div className="legal-orb-1" />
            <div className="legal-orb-2" />

            {/* Header section */}
            <header className="mb-24">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                  {dateLabel}
                </span>
              </div>
              
              <h1 className="font-serif text-6xl md:text-[5.5rem] font-normal tracking-tight text-white mb-8 leading-[1.05]">
                {title}
              </h1>
              
              {subtitle && (
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground/80 max-w-lg">
                  {subtitle}
                </p>
              )}
            </header>

            <div className="space-y-28">
              {children}
            </div>
            
            {/* Footer inside card */}
            <footer className="mt-32 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-[0.2em] text-muted-foreground/40 uppercase">
              <span>© 2026 GRAY MATTER LABS INC.</span>
              <div className="flex gap-6">
                <span className="hover:text-white transition-colors cursor-pointer">PRIVACY</span>
                <span className="hover:text-white transition-colors cursor-pointer">COOKIES</span>
                <span className="hover:text-white transition-colors cursor-pointer">SECURITY</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
    </>
  )
}

// ── Section ───────────────────────────────────────────────────

type LegalSectionProps = {
  id: string
  num: number
  title: React.ReactNode
  children: React.ReactNode
}

export function LegalSection({ id, num, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="relative scroll-mt-24">
      {/* Number and Title */}
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-serif text-5xl md:text-6xl italic text-[#4a2a1a] font-light translate-y-1 md:translate-y-2">
          {String(num).padStart(2, "0")}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-normal text-white tracking-tight">
          {title}
        </h2>
      </div>
      
      {/* Content */}
      <div className="space-y-6 text-sm md:text-[15px] leading-loose text-muted-foreground/90 font-light">
        {children}
      </div>
    </section>
  )
}

// ── Cards & UI Elements ───────────────────────────────────────

type LegalCardProps = {
  icon?: React.ReactNode
  title: React.ReactNode
  children: React.ReactNode
}

export function LegalCard({ icon, title, children }: LegalCardProps) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 mt-6">
      <div className="flex flex-col md:flex-row items-start gap-5">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-white mb-2">{title}</h4>
          <div className="text-sm md:text-[15px] text-muted-foreground/70 leading-loose text-balance">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── List ──────────────────────────────────────────────────────

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-4 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.6em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-primary">
      {children}
    </ul>
  )
}

// ── Contact block ─────────────────────────────────────────────

export function LegalContact({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 space-y-2 border-l-[3px] border-primary/30 pl-6 text-muted-foreground/80 text-[15px] leading-loose">
      {children}
    </div>
  )
}

// ── Sub-heading ───────────────────────────────────────────────

export function LegalH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-baseline gap-3 font-semibold text-white mt-8 mb-4">
      {children}
    </h3>
  )
}