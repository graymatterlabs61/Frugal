"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NavScrollProvider, useNavScroll } from "@/contexts/NavScrollContext";
import { ShinyButton } from "@/components/ui/shiny-button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features/openai" },
  { label: "Pricing", href: "/pricing" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

function NavInner() {
  const { scrolled } = useNavScroll();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div
      className={`fixed top-3 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] `}
    >
      <header className="pointer-events-auto mx-4 sm:mx-6 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.10] shadow-[0_8px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex h-14 max-w-7xl mx-auto items-center justify-between px-4 md:px-6 lg:px-8 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.svg"
              alt="Frugal"
              className="h-8 w-8 object-contain drop-shadow-[0_0_8px_#FF500B55] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_#FF500B88]"
            />
            <span className="font-ethnocentric text-base md:text-lg tracking-tight text-foreground">
              Frugal
            </span>
          </Link>

          {/* Desktop links */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="marketing-nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors duration-200"
            >
              Log in
            </Link>
            <Link href="/signup">
              <ShinyButton className="px-4 py-2 rounded-xl text-xs shadow-[0_0_12px_#FF500B4D]">
                Get started
              </ShinyButton>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={`inline-block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? "rotate-90 opacity-70" : "rotate-0 opacity-100"
                }`}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-white/[0.06] rounded-b-2xl ${menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${isActive(link.href)
                  ? "text-foreground bg-white/10 border border-white/20 backdrop-blur-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
              >
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                <ShinyButton className="w-full py-3 rounded-xl shadow-[0_0_12px_#FF500B4D]">
                  Get started
                </ShinyButton>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function MarketingNav() {
  return (
    <NavScrollProvider>
      <NavInner />
    </NavScrollProvider>
  );
}
