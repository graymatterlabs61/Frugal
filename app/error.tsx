"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 relative">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center gap-6 max-w-lg w-full">
        <p className="font-ethnocentric text-primary text-[10px] tracking-widest uppercase">
          Error 500
        </p>

        <div className="font-nasalization text-[8rem] sm:text-[12rem] leading-none text-foreground/[0.06] select-none -my-4">
          500
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
          An unexpected error occurred. Our team has been notified.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_20px_#FF500B4D]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-border text-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
