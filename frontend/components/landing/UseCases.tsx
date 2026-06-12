"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CodeIcon, RocketLaunchIcon, BuildingsIcon, ChartLineUpIcon } from "@phosphor-icons/react"

gsap.registerPlugin(ScrollTrigger)

const cases = [
  {
    label: "Indie developers",
    title: "Stop AI bills from killing side projects",
    body: "One misconfigured prompt loop can rack up hundreds of dollars overnight. Set hard spending caps and sleep knowing Frugal will cut it off before it hurts.",
    Icon: CodeIcon,
  },
  {
    label: "Engineering managers",
    title: "Know before your CFO asks",
    body: "Your team ships features using AI APIs every day. Frugal shows you exactly which project is burning what — before the invoice lands.",
    Icon: ChartLineUpIcon,
  },
  {
    label: "Startups & founders",
    title: "Make every dollar of runway count",
    body: "You're giving your team access to GPT, Claude, and Replicate. Frugal tracks what each project spends and blocks runaway costs before they eat your runway.",
    Icon: RocketLaunchIcon,
  },
  {
    label: "Companies & teams",
    title: "AI budget governance without the spreadsheet",
    body: "Set per-team and per-project budgets across every AI provider. Get automatic alerts and hard blocks. Know exactly who spent what before month-end.",
    Icon: BuildingsIcon,
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
            Built for the people <span className="text-foreground italic font-serif tracking-normal font-normal">paying the bill</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cases.map(({ label, title, body, Icon }) => (
            <div
              key={label}
              className="uc-card glass-panel backdrop-blur-md card-lift group relative overflow-hidden rounded-2xl p-7 transition-colors"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08]">
                <Icon size={22} className="text-primary" />
              </div>
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