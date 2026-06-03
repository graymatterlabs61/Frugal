import Link from "next/link";
import { GSAPShowcase } from "./GSAPShowcase";

interface AuthLayoutProps {
  children: React.ReactNode;
  showcase: React.ReactNode;
}

export function AuthLayout({ children, showcase }: AuthLayoutProps) {
  return (
    <div className="lg:grid lg:grid-cols-2 bg-background lg:h-screen">
      {/* Left: Auth Form — centered on all screen sizes */}
      <div className="flex items-start justify-center min-h-screen lg:min-h-0 overflow-y-auto px-6 pt-14 pb-12 lg:px-12 lg:items-center relative z-10">
        <div className="w-full max-w-[440px] animate-fade-in-up">
          {/* Logo */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo.svg"
                alt="Frugal"
                className="w-9 h-auto group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-xl tracking-tight">Frugal</span>
            </Link>
          </div>

          {children}
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
        <div className="absolute bottom-8 right-8 z-10 font-playwrite text-2xl opacity-20 select-none">
          Frugal
        </div>
      </div>
    </div>
  );
}