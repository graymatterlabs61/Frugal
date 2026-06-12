"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Mini chart data
const bars = [22, 35, 28, 48, 42, 62, 58, 74, 70, 82, 88, 95]

export function ProblemSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".prob-eyebrow, .prob-h2", {
        scrollTrigger: { trigger: ".prob-h2", start: "top 88%" },
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
      })
      gsap.from(".bento-card", {
        scrollTrigger: { trigger: ".bento-card", start: "top 85%" },
        y: 50,
        autoAlpha: 0,
        stagger: { amount: 0.5, from: "start" },
        duration: 0.8,
        ease: "power3.out",
      })
      gsap.from(".stat-bar", {
        scrollTrigger: { trigger: ".stat-bar", start: "top 85%" },
        scaleY: 0,
        transformOrigin: "bottom",
        stagger: 0.035,
        duration: 0.55,
        delay: 0.3,
        ease: "power2.out",
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="problem"
      className="px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        {/* Centered headline — Gladia style */}
        <div className="mb-14 text-center">
          <p className="prob-eyebrow mb-3 font-ethnocentric text-[10px] tracking-widest text-primary">
            The problem
          </p>
          <h2 className="prob-h2 mx-auto max-w-3xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            You only find out{" "}
            <span className="font-playfair italic tracking-normal font-normal">when the invoice arrives</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Solo developers watch costs spike overnight with no warning. Teams give everyone AI access and end up with no idea which project burned what. Providers give you keys — not budgets, not attribution, not control.
          </p>
        </div>

        {/* Bento grid — Gladia "Performance" layout */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2">
          {/* Large card (2 rows, 2 cols) — live chart */}
          <div className="bento-card glass-panel backdrop-blur-md relative row-span-1 overflow-hidden rounded-2xl p-7 md:col-span-2 md:row-span-2">
            {/* Top label */}
            <div className="mb-4">
              <p className="mb-1 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
                Spend attribution
              </p>
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Every provider. Every project.
                <br />
                Every team member.
              </h3>
            </div>

            {/* Simulated dashboard */}
            <div className="mt-6 rounded-xl glass-panel backdrop-blur-md bg-black/20 p-5 shadow-inner">
              {/* Total */}
              <div className="mb-5">
                <p className="text-xs text-muted-foreground">
                  Total AI spend this month
                </p>
                <p className="mt-1 font-nasalization text-3xl text-foreground">
                  $234.50
                </p>
              </div>
              {/* Bar chart */}
              <div className="flex h-16 items-end gap-1">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="stat-bar flex-1 rounded-sm"
                    style={{
                      height: `${h * 0.65}%`,
                      background:
                        h > 80
                          ? "linear-gradient(to top, oklch(0.65 0.22 30), oklch(0.75 0.18 50))"
                          : "linear-gradient(to top, oklch(0.45 0.28 288), oklch(0.65 0.27 288))",
                      opacity: 0.7 + i * 0.025,
                    }}
                  />
                ))}
              </div>
              {/* Provider rows */}
              <div className="mt-4 space-y-2.5">
                {[
                  { name: "OpenAI", pct: 78, spend: "$193.50", color: "oklch(0.65 0.22 35)" },
                  { name: "Anthropic", pct: 41, spend: "$41.00", color: "oklch(0.62 0.27 288)" },
                ].map((p) => (
                  <div key={p.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-muted-foreground">{p.spend}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.pct}%`,
                          background: `linear-gradient(90deg, oklch(0.45 0.28 288), ${p.color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Small card 1 — polling */}
          <div className="bento-card glass-panel backdrop-blur-md rounded-2xl p-6">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
              style={{ boxShadow: "0 0 20px oklch(0.62 0.27 288 / 0.2)" }}
            >
              <span className="font-ethnocentric text-xs text-primary">5m</span>
            </div>
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Polling interval
            </p>
            <p className="mt-1 font-nasalization text-2xl text-foreground">
              Sub-5 minute
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Usage data refreshed every 5 minutes — never out of sync.
            </p>
          </div>

          {/* Small card 2 — encryption */}
          <div className="bento-card glass-panel backdrop-blur-md rounded-2xl p-6">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
              style={{ boxShadow: "0 0 20px oklch(0.62 0.27 288 / 0.2)" }}
            >
              <span className="font-ethnocentric text-[9px] text-primary">AES</span>
            </div>
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Encryption
            </p>
            <p className="mt-1 font-nasalization text-2xl text-foreground">
              AES-256
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              API keys encrypted before storage. Never logged or exposed.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}