"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, LockKeyIcon, ShieldCheckIcon } from "@phosphor-icons/react"

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong")
      setDiscountCode(data.discountCode ?? null)
      setEmailSent(data.emailSent === true)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join the waitlist — please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })

      tl.from(".hero-badge", {
        y: -16,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
      })
        .from(".hero-line-1", {
          y: 70,
          autoAlpha: 0,
          duration: 0.95,
          ease: "power3.out",
        }, "-=0.2")
        .from(".hero-line-2", {
          y: 70,
          autoAlpha: 0,
          duration: 0.95,
          ease: "power3.out",
        }, "-=0.7")
        .from(".hero-sub", {
          y: 24,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
        }, "-=0.5")
        .from(".hero-ctas", {
          y: 20,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
        }, "-=0.45")
        .from(".hero-trust", {
          y: 12,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.out",
        }, "-=0.35")

      // Local glow orbs removed in favor of global mesh background
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20 text-center"
    >
      {/* Background handled by global mesh */}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Badge */}
        <div className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-ethnocentric text-[10px] tracking-widest text-primary">
            Coming Soon — Join the Waitlist
          </span>
        </div>

        {/* Headline — two lines, Gladia-style */}
        <div className="mb-6 overflow-hidden">
          <h1 className="font-nasalization">
            <span className="hero-line-1 block text-[clamp(2.4rem,6vw,5rem)] leading-[1.08] tracking-tight text-foreground">
              The cost management
            </span>
            <span className="hero-line-2 block text-[clamp(2.4rem,6vw,5rem)] leading-[1.08] tracking-tight text-foreground">
              backbone for AI builders.
            </span>
          </h1>
        </div>

        {/* Subhead */}
        <p className="hero-sub mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Frugal checks your OpenAI, Anthropic, Replicate, and fal.ai spend
          every 5 minutes. Set budget limits, get alerts before limits hit, and
          protect your runway from surprise invoices.
        </p>

        {/* CTAs */}
        <div className="hero-ctas mb-8">
          {submitted ? (
            <div className="inline-flex flex-col items-center gap-3">
              <div className="rounded-2xl border border-green-500/30 bg-green-500/[0.07] px-8 py-5 text-center">
                <p className="mb-1 font-semibold text-green-300">
                  You&apos;re on the list!
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  We&apos;ll email you when Frugal launches.
                </p>
                {discountCode && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    35% off your first plan with code{" "}
                    <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono font-semibold text-foreground">
                      {discountCode}
                    </span>
                    {emailSent
                      ? " — also sent to your inbox."
                      : " — save it somewhere safe."}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-12 flex-1 rounded-xl glass-panel bg-card/10 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="h-12 shrink-0 gap-2 rounded-xl px-6 font-semibold"
                style={{ boxShadow: "0 0 24px oklch(0.62 0.27 288 / 0.4)" }}
              >
                {loading ? "Joining…" : "Get Early Access"}
                <ArrowRightIcon size={16} />
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Trust line */}
        {!submitted && (
          <div className="hero-trust flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <LockKeyIcon size={12} className="text-primary" />
              No credit card required
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon size={12} className="text-primary" />
              35% off for early members
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-muted-foreground">
              Building on OpenAI · Anthropic · Replicate · fal.ai
            </span>
          </div>
        )}
      </div>
    </section>
  )
}