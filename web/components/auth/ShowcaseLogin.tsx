"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TrendingDown, ShieldCheck } from "lucide-react";

gsap.registerPlugin(useGSAP);

const BAR_DATA = [
  { h: 38, d: "M" },
  { h: 62, d: "T" },
  { h: 45, d: "W" },
  { h: 88, d: "T" },
  { h: 52, d: "F" },
  { h: 100, d: "S", peak: true },
  { h: 60, d: "S" },
  { h: 40, d: "M" },
];

const PROVIDERS = [
  { name: "OpenAI", pct: 50, color: "#10b981" },
  { name: "Anthropic", pct: 33, color: "#60a5fa" },
  { name: "Others", pct: 17, color: "#FF500B" },
];

export function ShowcaseLogin() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Immediately set initial hidden states (before GSAPShowcase reveals container)
      gsap.set(".sl-header", { autoAlpha: 0, y: -12 });
      gsap.set(".sl-bar", { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(".sl-peak", { autoAlpha: 0, y: 4 });
      gsap.set(".sl-provider-fill", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".sl-stat", { autoAlpha: 0, y: 8 });
      gsap.set(".sl-float", { autoAlpha: 0, y: 20, rotation: 3 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 1.0, // after GSAPShowcase entry finishes (~1.25s total)
      });

      tl.to(".sl-header", { autoAlpha: 1, y: 0, duration: 0.5 });

      tl.to(
        ".sl-bar",
        {
          scaleY: 1,
          duration: 0.6,
          stagger: 0.065,
          ease: "back.out(1.4)",
        },
        "-=0.25"
      );

      tl.to(".sl-peak", { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.35");

      tl.to(
        ".sl-provider-fill",
        {
          scaleX: 1,
          duration: 0.55,
          stagger: 0.12,
          ease: "power2.out",
        },
        "-=0.2"
      );

      tl.to(
        ".sl-stat",
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.09 },
        "-=0.2"
      );

      tl.to(
        ".sl-float",
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.75,
          ease: "back.out(1.2)",
        },
        "-=0.1"
      );

      // LIVE dot pulse — runs indefinitely
      gsap.to(".sl-live-dot", {
        scale: 1.6,
        opacity: 0.35,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.2,
      });
    },
    { scope: panelRef }
  );

  return (
    <div ref={panelRef} className="relative pb-14">
      {/* Main glass card */}
      <div className="glass-panel backdrop-blur-md p-7 rounded-2xl w-full relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="sl-header flex items-start justify-between mb-5">
          <div>
            <div className="text-[9px] font-mono tracking-widest uppercase opacity-40 mb-1">
              API SPEND MONITOR
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-3xl tracking-tight">$842</span>
              <span className="text-sm text-muted-foreground font-mono">.10</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-emerald-400 text-[10px] font-mono font-bold">
              <TrendingDown className="w-3 h-3" />
              −12.4% vs last month
            </div>
          </div>

          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold tracking-wider flex-shrink-0">
            <div className="sl-live-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
            LIVE
          </div>
        </div>

        {/* Bar chart */}
        <div
          className="flex items-end justify-between gap-1.5 mb-2"
          style={{ height: 88 }}
        >
          {BAR_DATA.map((bar, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center justify-end h-full flex-1"
            >
              {bar.peak && (
                <div className="sl-peak absolute -top-5 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-primary text-white text-[7px] font-mono font-bold rounded whitespace-nowrap">
                  PEAK
                </div>
              )}
              <div
                className={`sl-bar w-full rounded-t-sm ${bar.peak
                    ? "bg-gradient-to-t from-primary to-orange-400 shadow-[0_0_14px_rgba(255,80,11,0.4)]"
                    : "bg-white/10"
                  }`}
                style={{ height: `${bar.h}%` }}
              />
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="flex justify-between mb-5">
          {BAR_DATA.map((bar, i) => (
            <div key={i} className="flex-1 text-center text-[7px] font-mono opacity-25">
              {bar.d}
            </div>
          ))}
        </div>

        {/* Provider breakdown */}
        <div className="space-y-2.5 mb-5">
          {PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="text-[9px] font-mono opacity-40 w-16 flex-shrink-0">
                {p.name}
              </div>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="sl-provider-fill h-full rounded-full"
                  style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                />
              </div>
              <div className="text-[9px] font-mono opacity-40 w-7 text-right">
                {p.pct}%
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          {[
            { label: "Projected", val: "$1,420", cls: "" },
            { label: "Current", val: "$842", cls: "" },
            { label: "Saved", val: "$578", cls: "text-primary" },
          ].map(({ label, val, cls }) => (
            <div key={label} className="sl-stat">
              <div
                className={`text-[8px] font-mono tracking-wider uppercase mb-1 ${cls || "opacity-35"
                  }`}
              >
                {label}
              </div>
              <div className={`font-bold text-sm ${cls}`}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating alert card — within pb-14 zone so no overflow */}
      <div className="sl-float absolute bottom-2 right-0 glass-panel px-4 py-3 rounded-xl flex gap-3 items-center border border-primary/20 bg-background/85 backdrop-blur-xl shadow-2xl shadow-black/30">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-xs font-bold leading-none mb-0.5">Cost Guard Active</div>
          <div className="text-[9px] text-muted-foreground font-mono">
            Throttling 4 API keys
          </div>
        </div>
      </div>
    </div>
  );
}