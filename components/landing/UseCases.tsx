"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const cases = [
  {
    label: "Indie developers",
    title: "Protect your personal runway",
    body: "Side project costs can spiral overnight. Set a hard cap and sleep knowing you won't wake up to a surprise bill.",
    emoji: "🧑‍💻",
  },
  {
    label: "Startups",
    title: "Make every dollar of runway count",
    body: "Investor money is finite. Frugal ensures AI API costs never eat into the runway that fuels everything else.",
    emoji: "🚀",
  },
  {
    label: "Agencies",
    title: "Manage client AI budgets",
    body: "Track spend per client project. Set per-project limits and include Frugal alerts in your client SLAs.",
    emoji: "🏢",
  },
  {
    label: "Enterprise teams",
    title: "Cost governance at scale",
    body: "Multi-provider, multi-team visibility. Budget rules per team. Audit trails for every dollar spent.",
    emoji: "📊",
  },
]

export function UseCases() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".uc-head", {
        scrollTrigger: { trigger: ".uc-head", start: "top 88%" },
        y: 40,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
      })
      gsap.from(".uc-card", {
        scrollTrigger: { trigger: ".uc-card", start: "top 85%" },
        y: 50,
        autoAlpha: 0,
        stagger: { amount: 0.4, from: "start" },
        duration: 0.75,
        ease: "power3.out",
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      className="px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="uc-head mb-14 text-center">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
            Use cases
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            What you can build with <span className="text-foreground italic font-serif tracking-normal font-normal">Frugal</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cases.map(({ label, title, body, emoji }) => (
            <div
              key={label}
              className="uc-card glass-panel backdrop-blur-md group relative overflow-hidden rounded-2xl p-7 transition-colors"
            >
              <div className="mb-4 text-3xl">{emoji}</div>
              <p className="mb-1 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
                {label}
              </p>
              <h3 className="mb-2.5 font-heading text-xl font-bold text-foreground">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}