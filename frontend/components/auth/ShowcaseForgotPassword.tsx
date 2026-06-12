"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Lock, Shield } from "lucide-react";

gsap.registerPlugin(useGSAP);

const SEC_METRICS = [
  { label: "Encryption", val: "AES-256-GCM" },
  { label: "Safety Ratio", val: "99.9%" },
];

export function ShowcaseForgotPassword() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(".sfp-top", { autoAlpha: 0, y: -12 });
      gsap.set(".sfp-heading", { autoAlpha: 0, y: 16 });
      gsap.set(".sfp-body", { autoAlpha: 0, y: 12 });
      gsap.set(".sfp-metric", { autoAlpha: 0, x: -16 });
      gsap.set(".sfp-bar-fill", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".sfp-float", { autoAlpha: 0, y: 20, rotation: 2 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 1.0,
      });

      tl.to(".sfp-top", { autoAlpha: 1, y: 0, duration: 0.5 });
      tl.to(".sfp-heading", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.2");
      tl.to(".sfp-body", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.2");

      tl.to(
        ".sfp-metric",
        { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.1 },
        "-=0.15"
      );

      tl.to(
        ".sfp-bar-fill",
        { scaleX: 1, duration: 0.8, ease: "power2.out" },
        "-=0.2"
      );

      tl.to(
        ".sfp-float",
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.75,
          ease: "back.out(1.2)",
        },
        "-=0.1"
      );

      // Shield icon subtle rotation pulse
      gsap.to(".sfp-shield", {
        rotation: 5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.0,
        transformOrigin: "center center",
      });
    },
    { scope: panelRef }
  );

  return (
    <div ref={panelRef} className="relative pb-14">
      <div className="glass-panel backdrop-blur-md p-8 rounded-2xl w-full relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Top row: shield icon + encrypted badge */}
        <div className="sfp-top flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-card border border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent" />
            <Shield className="sfp-shield w-7 h-7 text-primary relative z-10" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ENCRYPTED
          </div>
        </div>

        {/* Heading */}
        <h2 className="sfp-heading font-serif text-5xl leading-tight mb-5 tracking-tight">
          Protect your <br />
          <span className="font-playwrite opacity-60">runway</span>
        </h2>

        {/* Body */}
        <p className="sfp-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-xs">
          Automated cost protection monitors every API request before costs spiral.
          Zero-knowledge, bank-grade security by design.
        </p>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {SEC_METRICS.map(({ label, val }) => (
            <div key={label} className="sfp-metric">
              <div className="text-[9px] font-mono tracking-wider opacity-40 uppercase mb-1.5">
                {label}
              </div>
              <div className="font-bold text-lg">{val}</div>
            </div>
          ))}
        </div>

        {/* Vault status bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[9px] font-mono tracking-wider uppercase">
            <span className="opacity-40">VAULT SECURITY STATUS</span>
            <span className="text-primary font-bold">OPTIMAL</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="sfp-bar-fill h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
              style={{ width: "88%" }}
            />
          </div>
        </div>
      </div>

      {/* Floating card */}
      <div className="sfp-float absolute bottom-2 right-0 glass-panel px-4 py-3 rounded-xl flex gap-3 items-center border border-primary/20 bg-background/85 backdrop-blur-xl shadow-2xl shadow-black/30">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold leading-none mb-0.5">AES-256 Active</div>
          <div className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">
            Bank-grade
          </div>
        </div>
      </div>
    </div>
  );
}