import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — Page Not Found | Frugal",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 relative">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center gap-6 max-w-lg w-full">
        <p className="font-ethnocentric text-primary text-[10px] tracking-widest uppercase">
          Error 404
        </p>

        <div className="font-nasalization text-[8rem] sm:text-[12rem] leading-none text-foreground/[0.06] select-none -my-4">
          404
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Page not found
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_20px_#FF500B4D] mt-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
