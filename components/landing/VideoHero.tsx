"use client"

import { useState } from "react"
import { Check } from "lucide-react"

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4"


export function VideoHero() {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || sending) return
    setSending(true)
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
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join the waitlist — please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div id="video-hero" className="min-h-screen bg-background p-3 sm:p-4 md:p-6 text-foreground">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)] bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-full p-4 sm:p-6 md:p-8 gap-6">

          <div className="flex-1 min-h-[2rem]" />

          {/* Bottom row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            {/* Headline */}
            <div className="flex flex-col gap-4 lg:max-w-lg xl:max-w-2xl shrink-0">
              <h1 className="text-white text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight drop-shadow-lg">
                AI API cost management & <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>OpenAI cost monitoring tool</span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg drop-shadow-md">
                Frugal checks your OpenAI, Anthropic, Replicate, and fal.ai spend every 5 minutes. Set budget limits and protect your runway from surprise invoices.
              </p>
            </div>

            {/* Contact form card */}
            <div className="w-full lg:w-[min(420px,45%)] shrink-0">
              <div className="glass-panel text-card-foreground backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 flex flex-col gap-4">

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary">
                      <Check size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">You&apos;re on the list!</h3>
                    <p className="text-sm text-muted-foreground">We&apos;ll email you when Frugal launches.</p>
                    {discountCode && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        35% off your first plan with code{" "}
                        <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono font-semibold text-foreground">
                          {discountCode}
                        </span>
                        {emailSent && " — also sent to your inbox."}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                      Get Early Access
                    </h2>

                    <div className="flex flex-col gap-2 bg-muted/50 rounded-2xl px-4 py-3">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <Check size={14} className="text-primary" />
                        No credit card required
                      </span>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <Check size={14} className="text-primary" />
                        35% off for early members
                      </span>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">
                          Work Email
                        </label>
                        <input
                          type="email"
                          placeholder="you@company.com"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full text-sm px-4 py-3 rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition text-foreground"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-60 mt-1 shadow-[0_0_20px_oklch(0.62_0.27_288/0.3)]"
                      >
                        {sending ? 'Joining...' : 'Join the waitlist'}
                      </button>
                      {error && (
                        <p role="alert" className="text-sm text-red-400">
                          {error}
                        </p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
