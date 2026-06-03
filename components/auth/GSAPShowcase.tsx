"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function GSAPShowcase({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Entry: fade + scale + blur reveal
      gsap.fromTo(
        containerRef.current,
        { autoAlpha: 0, scale: 0.94, y: 18, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          delay: 0.15,
        }
      );

      // Ambient float — starts after entry completes
      gsap.to(containerRef.current, {
        y: -10,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.4,
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} style={{ visibility: "hidden" }} className="w-full">
      {children}
    </div>
  );
}