"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Lock, ShieldCheck, Mail } from "lucide-react";

gsap.registerPlugin(useGSAP);

const STATUS_BLOCKS = [
  { label: "VAULT STATE", val: "LOCKED", color: "bg-emerald-500" },
  { label: "SYNC STATUS", val: "ACTIVE", color: "bg-primary" },
];

export function ShowcaseVerifyEmail() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(".sve-badge", { autoAlpha: 0, y: -8 });
      gsap.set(".sve-icon", { autoAlpha: 0, scale: 0.6, rotation: -10 });
      gsap.set(".sve-heading", { autoAlpha: 0, x: -16 });
      gsap.set(".sve-enc-block", { autoAlpha: 0, y: 12 });
      gsap.set(".sve-enc-bar", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".sve-status-block", { autoAlpha: 0, y: 10 });
      gsap.set(".sve-body", { autoAlpha: 0 });
      gsap.set(".sve-float", { autoAlpha: 0, y: 16, rotation: 2 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 1.0,
      });

      // Badge + icon together
      tl.to(".sve-badge", { autoAlpha: 1, y: 0, duration: 0.4 });
      tl.to(
        ".sve-icon",
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
        "<0.1"
      );

      tl.to(".sve-heading", { autoAlpha: 1, x: 0, duration: 0.5 }, "-=0.2");

      tl.to(".sve-enc-block", { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1");
      tl.to(".sve-enc-bar", { scaleX: 1, duration: 0.9, ease: "power2.out" }, "-=0.1");

      tl.to(
        ".sve-status-block",
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.4"
      );

      tl.to(".sve-body", { autoAlpha: 1, duration: 0.5 }, "-=0.1");

      tl.to(
        ".sve-float",
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.7,
          ease: "back.out(1.2)",
        },
        "-=0.2"
      );

      // Shield icon pulse
      gsap.to(".sve-shield-icon", {
        scale: 1.08,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.5,
      });

      // Mail icon sway
      gsap.to(".sve-mail", {
        y: -3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3.0,
      });
    },
    { scope: panelRef }
  );

  return (
    <div ref={panelRef} className="relative pb-14">
      <div className="glass-panel backdrop-blur-md p-8 rounded-2xl w-full relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        {/* Top section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="sve-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-mono font-bold tracking-wider mb-4">
              SECURITY NODE
            </div>
            <h2 className="sve-heading font-playwrite text-4xl tracking-tight">
              Identity Verified
            </h2>
          </div>
          <div className="sve-icon w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,80,11,0.3)] flex-shrink-0">
            <ShieldCheck className="sve-shield-icon w-6 h-6 text-white" />
          </div>
        </div>

        {/* Encryption block */}
        <div className="sve-enc-block bg-white/4 border border-white/8 rounded-xl p-5 mb-3">
          <div className="flex justify-between items-center text-[9px] font-mono tracking-wider uppercase mb-3">
            <span className="opacity-45">ENCRYPTION STANDARD</span>
            <span className="font-bold">AES-256-GCM</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="sve-enc-bar h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
              style={{ width: "90%" }}
            />
          </div>
        </div>

        {/* Status blocks */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {STATUS_BLOCKS.map(({ label, val, color }) => (
            <div
              key={label}
              className="sve-status-block bg-white/4 border border-white/8 rounded-xl p-4"
            >
              <div className="text-[9px] font-mono tracking-wider opacity-45 uppercase mb-2">
                {label}
              </div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <p className="sve-body text-xs text-muted-foreground leading-relaxed">
          Frugal uses bank-grade security layers to ensure your workspace and API keys
          remain strictly confidential at all times.
        </p>
      </div>

      {/* Floating card */}
      <div className="sve-float absolute bottom-2 right-0 glass-panel px-4 py-2.5 rounded-xl flex gap-2.5 items-center border border-white/10 bg-background/85 backdrop-blur-xl shadow-2xl shadow-black/30">
        <Mail className="sve-mail w-4 h-4 text-emerald-400 flex-shrink-0" />
        <div>
          <div className="text-xs font-bold leading-none mb-0.5">Email Confirmed</div>
          <div className="text-[9px] font-mono opacity-50">Session encrypted</div>
        </div>
        <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-1" />
      </div>
    </div>
  );
}