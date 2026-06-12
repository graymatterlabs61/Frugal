"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or denied
    const consent = localStorage.getItem("frugal-cookie-consent");
    if (!consent) {
      // Delay showing slightly for a better entrance
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("frugal-cookie-consent", "granted");
    setShow(false);

    // Update gtag consent state
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem("frugal-cookie-consent", "denied");
    setShow(false);
    // Consent mode default is already denied, so no further gtag updates are required.
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-[380px] p-5 rounded-2xl backdrop-blur-xl bg-background/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col gap-4 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 border border-primary/20">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">We value your privacy</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            We use cookies to measure ad performance and analyze site traffic. Your data helps us improve Frugal.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 mt-1">
        <button
          onClick={handleDecline}
          className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-xs font-semibold text-foreground"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-xs font-semibold text-primary-foreground shadow-[0_0_15px_rgba(255,80,11,0.3)]"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
