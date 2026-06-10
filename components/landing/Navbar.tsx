"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("video-hero")
      if (hero) {
        setScrolled(hero.getBoundingClientRect().bottom < 100)
      } else {
        setScrolled(window.scrollY > 100)
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    const container = containerRef.current
    if (!nav || !container) return

    if (scrolled) {
      const containerWidth = container.offsetWidth
      const navWidth = nav.offsetWidth
      const computedStyle = window.getComputedStyle(container)
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
      const targetX = (containerWidth / 2) - (navWidth / 2) - paddingLeft
      gsap.to(nav, { x: targetX, y: -8, duration: 0.8, ease: "power3.out" })
    } else {
      gsap.to(nav, { x: 0, y: 0, duration: 0.8, ease: "power3.out" })
    }
  }, [scrolled])

  return (
    <div
      ref={containerRef}
      className="fixed top-7 sm:top-10 md:top-14 left-0 right-0 z-50 flex justify-start pointer-events-none px-7 sm:px-10 md:px-14 transition-all"
    >
      <nav
        ref={navRef}
        className="pointer-events-auto glass-panel backdrop-blur-md rounded-2xl pl-3 sm:pl-4 pr-2 py-2 w-full sm:w-auto flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            <div className="flex h-8 items-center justify-center transition-opacity hover:opacity-80 drop-shadow-[0_0_10px_#FF500B66]">
              <img src="/logo.svg" alt="Frugal Logo" className="h-10 w-10 object-contain" />
            </div>
            <span className="font-ethnocentric text-md md:text-lg lg:text-xl tracking-tight text-foreground block">
              Frugal
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto sm:ml-0 flex items-center gap-1">
            <button
              className="sm:hidden p-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a
              href="#waitlist"
              className="hidden sm:inline-flex bg-primary text-primary-foreground text-sm font-medium px-4 sm:px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_12px_#FF500B4D]"
            >
              Join Waitlist &rarr;
            </a>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden mt-2 pt-3 border-t border-white/10 flex flex-col gap-1 pb-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-foreground/80 text-sm font-medium hover:text-foreground transition-colors px-2 py-2.5 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setMenuOpen(false)}
              className="mt-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors text-center shadow-[0_0_12px_#FF500B4D]"
            >
              Join Waitlist &rarr;
            </a>
          </div>
        )}
      </nav>
    </div>
  )
}