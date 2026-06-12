"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { ShimmerButton } from "@/components/ui/magic/shimmer-button"

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4"

const TRUST_POINTS = [
  "Free plan, no credit card",
  "No proxy, no code changes",
  "Keys AES-256 encrypted",
]

export function VideoHero() {
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-full p-4 sm:p-6 md:p-8 gap-6">

          <div className="flex-1 min-h-[2rem]" />

          {/* Bottom row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Headline */}
            <div className="flex flex-col gap-5 lg:max-w-xl xl:max-w-2xl shrink-0">
              <p className="font-ethnocentric text-[10px] sm:text-xs tracking-[0.25em] text-primary uppercase drop-shadow-md">
                AI API cost management
              </p>
              <h1 className="text-white text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[1.05] tracking-tight drop-shadow-lg">
                Know your AI spend{" "}
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
                  before the invoice
                </span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-lg drop-shadow-md">
                Frugal checks your OpenAI, Anthropic, Replicate, and fal.ai usage
                every 5 minutes, tracks burn rate per project, and alerts you
                before budgets blow up.
              </p>
            </div>

            {/* CTA card */}
            <div className="w-full lg:w-auto shrink-0">
              <div className="glass-panel backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-5 lg:min-w-[340px]">
                <div className="flex flex-col gap-2.5">
                  {TRUST_POINTS.map((point) => (
                    <span
                      key={point}
                      className="text-sm text-white/85 font-medium flex items-center gap-2.5"
                    >
                      <Check size={15} className="text-primary shrink-0" />
                      {point}
                    </span>
                  ))}
                </div>

                <Link href="/signup" className="w-full">
                  <ShimmerButton
                    background="rgba(255,80,11,1)"
                    shimmerColor="#ffffff"
                    borderRadius="12px"
                    className="w-full text-sm font-semibold py-3.5 gap-2"
                  >
                    Start monitoring free
                    <ArrowRight size={16} />
                  </ShimmerButton>
                </Link>

                <a
                  href="#how-it-works"
                  className="text-center text-sm text-white/70 hover:text-white font-medium transition-colors"
                >
                  See how it works
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}