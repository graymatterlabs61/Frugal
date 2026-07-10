"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "frugal_popup_dismissed";
const COOLDOWN_DAYS = 7;
const TIMER_DELAY_MS = 15_000;

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < COOLDOWN_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

export function ExitPopup() {
  const [open, setOpen] = useState(false);
  const triggered = useRef(false);

  const trigger = () => {
    if (triggered.current || isDismissed()) return;
    triggered.current = true;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    markDismissed();
  };

  useEffect(() => {
    if (isDismissed()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };

    const timer = setTimeout(trigger, TIMER_DELAY_MS);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Get started with Frugal"
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

        {/* Banner image */}
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src="/popup-banner.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/og.png";
            }}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0d0f]" />
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-[#0d0d0f] px-7 pb-7 -mt-1 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Free to start
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold leading-tight">
              Stop getting surprised by AI bills.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Frugal tracks your OpenAI, Anthropic &amp; Replicate spend in real-time — and alerts you before costs spiral.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex -space-x-1.5">
              {["N", "A", "R", "S"].map((initial, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-[#0d0d0f] flex items-center justify-center text-[9px] font-bold text-primary"
                >
                  {initial}
                </div>
              ))}
            </div>
            <span>Trusted by AI builders</span>
          </div>

          <div className="space-y-3">
            <Link
              href="/signup"
              onClick={close}
              className="flex items-center justify-center w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-[0_4px_20px_rgba(255,80,11,0.4)]"
            >
              Start Free — No Credit Card
            </Link>
            <p className="text-center">
              <button
                onClick={close}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
              >
                No thanks, I enjoy surprise API bills
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}