"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Clock, Shield, Zap, Star, Bell } from "lucide-react";

gsap.registerPlugin(useGSAP);

const FEATURES = [
  {
    icon: Clock,
    title: "Sub-5 min polling",
    desc: "Near real-time cost ingestion across all providers.",
  },
  {
    icon: Shield,
    title: "AES-256 vault",
    desc: "Zero-knowledge encryption. Keys never stored in plaintext.",
  },
  {
    icon: Zap,
    title: "Auto-throttle",
    desc: "Budget rules fire before your bill hits the limit.",
  },
];

const ALERTS = [
  { time: "2m ago", msg: "OpenAI spend hit 80% threshold", type: "warn" },
  { time: "14m ago", msg: "Budget rule triggered — key throttled", type: "action" },
  { time: "1h ago", msg: "Daily report sent to slack", type: "info" },
];

export function ShowcaseSignup() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(".ss-badge", { autoAlpha: 0, y: -8 });
      gsap.set(".ss-heading", { autoAlpha: 0, y: 16 });
      gsap.set(".ss-feature", { autoAlpha: 0, x: -20 });
      gsap.set(".ss-divider", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".ss-alert", { autoAlpha: 0, x: 16 });
      gsap.set(".ss-proof", { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 1.0,
      });

      tl.to(".ss-badge", { autoAlpha: 1, y: 0, duration: 0.4 });
      tl.to(".ss-heading", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.2");

      tl.to(
        ".ss-feature",
        { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.12 },
        "-=0.2"
      );

      tl.to(".ss-divider", { scaleX: 1, duration: 0.6, ease: "power2.out" }, "-=0.1");

      tl.to(
        ".ss-alert",
        { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1 },
        "-=0.2"
      );

      tl.to(".ss-proof", { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1");

      // Alert bell shimmer — infinite
      gsap.to(".ss-bell", {
        rotation: 15,
        duration: 0.15,
        repeat: 5,
        yoyo: true,
        ease: "none",
        delay: 2.8,
        repeatDelay: 4,
      });
    },
    { scope: panelRef }
  );

  return (
    <div ref={panelRef} className="glass-panel backdrop-blur-md p-7 rounded-2xl w-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="ss-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] font-mono font-bold tracking-wider text-primary">
          SYSTEM INTEGRITY: SECURED
        </span>
      </div>

      {/* Heading */}
      <h2 className="ss-heading font-serif text-4xl leading-tight mb-7 tracking-tight">
        Unmatched control{" "}
        <span className="font-playwrite opacity-55">for modern API stacks.</span>
      </h2>

      {/* Feature list */}
      <div className="space-y-5 mb-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="ss-feature flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-primary" size={18} />
            </div>
            <div>
              <div className="font-bold text-sm mb-0.5">{title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="ss-divider h-px bg-white/5 mb-5" />

      {/* Live alert feed */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="ss-bell w-3 h-3 text-primary" />
          <span className="text-[9px] font-mono tracking-wider uppercase opacity-50">
            Recent Alerts
          </span>
        </div>
        <div className="space-y-2">
          {ALERTS.map((alert, i) => (
            <div
              key={i}
              className="ss-alert flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3 border border-white/5"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.type === "warn"
                    ? "bg-amber-400"
                    : alert.type === "action"
                      ? "bg-primary"
                      : "bg-emerald-400"
                  }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium truncate">{alert.msg}</div>
              </div>
              <div className="text-[8px] font-mono opacity-35 flex-shrink-0">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="ss-proof flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[32, 44, 12, 68].map((seed) => (
              <img
                key={seed}
                src={`https://i.pravatar.cc/40?img=${seed}`}
                alt="Developer"
                className="w-7 h-7 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <span className="text-[9px] font-mono tracking-wider opacity-50 uppercase">
            4k+ Developers
          </span>
        </div>
        <div className="flex gap-0.5 text-primary">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
      </div>
    </div>
  );
}