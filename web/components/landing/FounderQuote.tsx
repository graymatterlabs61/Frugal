import { TrustBar } from "./TrustBar"

export function FounderQuote() {
  return (
    <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
      <div className="glass-panel backdrop-blur-md rounded-3xl p-10 md:p-16 mx-auto max-w-4xl text-center border-primary/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <blockquote className="font-playfair text-2xl md:text-4xl leading-snug text-foreground italic">
          &ldquo;In 2025 I lost a product with 50,000 users to a surprise AI
          bill. Frugal is the alarm system I wish I&apos;d had — so I built
          it.&rdquo;
        </blockquote>
        <p className="mt-8 text-sm font-bold text-muted-foreground uppercase tracking-widest text-primary/80">
          — Nilesh Kumar, Founder
        </p>
        <TrustBar className="mt-12" />
      </div>
    </section>
  )
}
