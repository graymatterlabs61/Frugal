import Link from "next/link";
import { GSAPShowcase } from "./GSAPShowcase";

interface AuthLayoutProps {
  children: React.ReactNode;
  showcase: React.ReactNode;
}

export function AuthLayout({ children, showcase }: AuthLayoutProps) {
  return (
    <div className="lg:grid lg:grid-cols-2 bg-background lg:h-screen">
      {/* Ambient backdrop — gives the form side depth and feeds the glass blur */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.45 }} />
        <div className="mesh-orb mesh-orb-3" style={{ opacity: 0.38 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.18 }} />
      </div>

      {/* Left: Auth Form — centered on all screen sizes */}
      <div className="flex items-start justify-center min-h-screen lg:min-h-0 overflow-y-auto px-4 pt-10 pb-10 sm:px-6 lg:px-12 lg:items-center relative z-10">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up flex items-center justify-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Frugal"
              className="w-10 h-auto group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_10px_#FF500B66]"
            />
            <span className="font-ethnocentric text-2xl tracking-tight pt-4">Frugal</span>
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8 animate-fade-in-scale stagger-1 shadow-[0_24px_64px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08] overflow-hidden relative">
            {/* Ambient glow orb at top of panel */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-24 bg-primary/[0.08] blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Showcase — no overflow-hidden so floating cards aren't clipped */}
      <div className="hidden lg:flex relative flex-col items-center justify-center border-l border-border/50">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_031045_0e1165dd-ab48-46e3-ad3d-5fe77f217647.mp4"
            type="video/mp4"
          />
        </video>

        {/* Backdrop overlay with blur */}
        <div className="absolute inset-0 bg-background/55 backdrop-blur-[3px] z-[1]" />

        {/* Showcase content */}
        <div className="relative z-10 w-full max-w-lg px-10 py-8">
          <GSAPShowcase>{showcase}</GSAPShowcase>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-8 right-8 z-10 font-ethnocentric text-lg tracking-tight opacity-20 select-none uppercase">
          Frugal
        </div>
      </div>
    </div>
  );
}