"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { KeyIcon, SlidersHorizontalIcon, BellRingingIcon } from "@phosphor-icons/react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: "01",
    Icon: KeyIcon,
    title: "Connect your providers",
    body: "Paste your API keys or invite your team and assign theirs. Frugal validates and starts tracking immediately — all keys encrypted with AES-256 before touching the database.",
  },
  {
    num: "02",
    Icon: SlidersHorizontalIcon,
    title: "Set budgets per project or team",
    body: "Monthly limits per provider, per project, or per team. Alert at 80%, 90%, 100% — or any threshold you choose. Works for a solo dev's side project or a 20-person engineering org.",
  },
  {
    num: "03",
    Icon: BellRingingIcon,
    title: "Enforce limits, not just notifications",
    body: "Frugal polls every 5 minutes. Hard budget blocks and Slack/email alerts fire the moment a threshold is crossed — so you stop runaway spend, not just hear about it.",
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-head", {
        scrollTrigger: { trigger: ".hiw-head", start: "top 88%" },
        y: 40,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
      })
      gsap.from(".hiw-step", {
        scrollTrigger: { trigger: ".hiw-step", start: "top 85%" },
        y: 50,
        autoAlpha: 0,
        stagger: 0.16,
        duration: 0.8,
        ease: "power3.out",
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="mx-4 sm:mx-6 md:mx-8 lg:mx-auto max-w-6xl rounded-3xl py-24 md:py-32 my-24 relative z-10"
    >
      <div className="mx-auto max-w-5xl">
        <div className="hiw-head mb-16 text-center">
          <p className="mb-3 font-ethnocentric text-[10px] tracking-widest text-primary">
            How it works
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Up and running in three steps
          </h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Desktop connector line */}
          <div
            className="pointer-events-none absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.62 0.27 288 / 0.4), oklch(0.62 0.27 288 / 0.1), oklch(0.62 0.27 288 / 0.4))",
            }}
          />

          {steps.map(({ num, Icon, title, body }) => (
            <div key={num} className="hiw-step relative flex flex-col gap-6 glass-panel backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-neutral-200 dark:border-white/[0.05] shadow-lg dark:shadow-none transition-transform duration-300 hover:-translate-y-2">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl border border-primary/20 bg-primary/[0.08]"
                  style={{ boxShadow: "0 0 28px oklch(0.62 0.27 288 / 0.15)" }}
                />
                <Icon size={26} className="relative z-10 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-ethnocentric text-[8px] text-white">
                  {num.replace("0", "")}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
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