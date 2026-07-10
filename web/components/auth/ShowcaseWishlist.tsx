"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Gift, Users, Bell, Zap, Lock } from "lucide-react";

gsap.registerPlugin(useGSAP);

const REFERRALS = [
  { name: "Priya S.", discount: "+1%", time: "just now" },
  { name: "Marcus T.", discount: "+1%", time: "3m ago" },
  { name: "Aiko N.", discount: "+1%", time: "11m ago" },
];

const PERKS = [
  { icon: Gift, label: "25% off — first year" },
  { icon: Bell, label: "Dev updates direct to inbox" },
  { icon: Zap, label: "Early access, first in line" },
  { icon: Users, label: "+1% per referral, up to 50%" },
];

export function ShowcaseWishlist() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(".sw-badge", { autoAlpha: 0, y: -8 });
      gsap.set(".sw-heading", { autoAlpha: 0, y: 16 });
      gsap.set(".sw-perk", { autoAlpha: 0, x: -20 });
      gsap.set(".sw-divider", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".sw-ref", { autoAlpha: 0, x: 16 });
      gsap.set(".sw-meter", { autoAlpha: 0, y: 10 });
      gsap.set(".sw-bar", { width: "0%" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.8 });

      tl.to(".sw-badge", { autoAlpha: 1, y: 0, duration: 0.4 });
      tl.to(".sw-heading", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.2");
      tl.to(".sw-perk", { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.1 }, "-=0.3");
      tl.to(".sw-divider", { scaleX: 1, duration: 0.5, ease: "power2.out" }, "-=0.1");
      tl.to(".sw-ref", { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.1 }, "-=0.1");
      tl.to(".sw-meter", { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1");

      // Animate bar to 52% (base 25 + 3 refs = 28/50 of max)
      tl.to(".sw-bar", { width: "56%", duration: 1.2, ease: "power2.out" }, "-=0.2");
    },
    { scope: panelRef },
  );

  return (
    <div
      ref={panelRef}
      className="glass-panel backdrop-blur-md p-7 rounded-2xl w-full relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="sw-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] font-mono font-bold tracking-wider text-primary uppercase">
          Pre-launch wishlist open
        </span>
      </div>

      {/* Heading */}
      <h2 className="sw-heading font-serif text-4xl leading-tight mb-6 tracking-tight">
        Lock in your discount{" "}
        <span className="font-playwrite opacity-55">before we ship.</span>
      </h2>

      {/* Perks */}
      <div className="space-y-4 mb-6">
        {PERKS.map(({ icon: Icon, label }) => (
          <div key={label} className="sw-perk flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon className="text-primary" size={14} />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="sw-divider h-px bg-white/5 mb-5" />

      {/* Live referral feed */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-mono tracking-wider uppercase opacity-50">
            Recent referrals
          </span>
        </div>
        <div className="space-y-2">
          {REFERRALS.map((r, i) => (
            <div
              key={i}
              className="sw-ref flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3 border border-white/5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
              <span className="text-[10px] font-medium flex-1 truncate">{r.name} joined</span>
              <span className="text-[10px] font-mono font-bold text-primary">{r.discount}</span>
              <span className="text-[8px] font-mono opacity-35 flex-shrink-0">{r.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discount meter */}
      <div className="sw-meter p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Lock size={11} className="text-primary" />
            <span className="text-[10px] font-mono tracking-wider uppercase opacity-60">
              Discount meter
            </span>
          </div>
          <span className="text-base font-bold text-primary tabular-nums">28%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div className="sw-bar absolute inset-y-0 left-0 rounded-full bg-primary" />
        </div>
        <p className="text-[9px] text-muted-foreground mt-2 font-mono">
          Base 25% + 3 referrals · max 50%
        </p>
      </div>
    </div>
  );
}
