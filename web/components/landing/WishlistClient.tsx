"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, ArrowRight, Tag } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseWishlist } from "@/components/auth/ShowcaseWishlist";
import Link from "next/link";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://getfrugal.dev";

interface JoinedState {
  referralCode: string;
  referralCount: number;
  alreadyJoined?: boolean;
}

export function WishlistClient() {
  const searchParams = useSearchParams();
  const urlRefCode = searchParams.get("ref") ?? "";

  const [email, setEmail] = useState("");
  const [refInput, setRefInput] = useState(urlRefCode);
  const [showReferralInput, setShowReferralInput] = useState(!!urlRefCode);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState<JoinedState | null>(null);
  const [copied, setCopied] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Update refInput if URL param changes (e.g. user pastes link)
  useEffect(() => {
    if (urlRefCode) setRefInput(urlRefCode);
  }, [urlRefCode]);

  const discountPercent = joined
    ? Math.min(25 + joined.referralCount, 50)
    : 25;

  const referralLink = joined
    ? `${SITE_URL}/wishlist?ref=${joined.referralCode}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          referredBy: refInput.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        referralCode?: string;
        referralCount?: number;
        alreadyJoined?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to join");
      setJoined({
        referralCode: data.referralCode!,
        referralCount: data.referralCount ?? 0,
        alreadyJoined: data.alreadyJoined,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async () => {
    if (!joined) return;
    await navigator.clipboard.writeText(joined.referralCode);
    toast.success("Referral code copied");
  };

  return (
    <AuthLayout showcase={<ShowcaseWishlist />}>
      <AnimatePresence mode="wait">
        {!joined ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Join the{" "}
                <span className="font-serif italic font-normal gradient-text-warm">
                  wishlist
                </span>
              </h1>
              <p className="text-muted-foreground">
                Lock in 25% off before Frugal launches. Share your code for more.
              </p>
            </div>

            <form
              className="space-y-4 animate-fade-in-up stagger-1"
              onSubmit={handleSubmit}
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Your email
                </label>
                <Input
                  ref={emailRef}
                  type="email"
                  placeholder="you@company.com"
                  className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Referral code input */}
              {!showReferralInput ? (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors underline decoration-muted-foreground/30 underline-offset-4"
                >
                  Have a referral code?
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Referral code{" "}
                    <span className="normal-case font-normal tracking-normal text-muted-foreground/50">
                      (optional — earn +1% extra)
                    </span>
                  </label>
                  <div className="relative">
                    <Tag
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                    />
                    <Input
                      type="text"
                      placeholder="e.g. a3f9b2c1"
                      className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl pl-9 pr-4 transition-all duration-200 font-mono text-sm"
                      value={refInput}
                      onChange={(e) => setRefInput(e.target.value.trim())}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {refInput && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        <Check size={10} className="text-primary" />
                        <span className="text-[10px] text-primary font-medium">+1%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold mt-1 bg-primary hover:bg-primary/90 text-white btn-glow shadow-[0_4px_24px_rgba(255,80,11,0.3)]"
              >
                {loading ? "Saving your spot…" : "Join wishlist"}
                {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
              </Button>

              <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                No credit card. No spam. We&apos;ll email your confirmation and discount code right away.
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col space-y-6"
          >
            {/* Header */}
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                  <Check size={14} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {joined.alreadyJoined ? "You have already joined" : "You're on the wishlist"}
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {discountPercent}%{" "}
                <span className="font-serif italic font-normal gradient-text-warm">
                  locked in
                </span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Check your inbox — we sent your confirmation and referral link.
              </p>
            </div>

            {/* Referral CODE — prominent */}
            <div className="animate-fade-in-up stagger-1 p-5 rounded-2xl bg-primary/[0.06] border border-primary/20">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                Your referral code
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-11 rounded-xl bg-black/30 border border-primary/25 flex items-center px-4 cursor-pointer"
                  onClick={copyCode}
                >
                  <span className="font-mono text-lg font-bold text-primary tracking-widest">
                    {joined.referralCode}
                  </span>
                </div>
                <Button
                  onClick={copyCode}
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-primary/25 bg-primary/[0.08] hover:bg-primary/[0.15] shrink-0"
                >
                  <Copy size={14} className="text-primary" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                Share this code or the link below. Each signup gives you +1% (max 50%).
              </p>
            </div>

            {/* Discount meter */}
            <div className="animate-fade-in-up stagger-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground/60">
                  Your discount
                </span>
                <span className="text-xl font-bold text-primary tabular-nums">
                  {discountPercent}%
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(discountPercent / 50) * 100}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/50 font-mono">
                Base 25% + {joined.referralCount} referral
                {joined.referralCount !== 1 ? "s" : ""} · max 50%
              </p>
            </div>

            {/* Full referral link */}
            <div className="animate-fade-in-up stagger-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Referral link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 flex items-center overflow-hidden">
                  <span className="text-xs text-muted-foreground truncate font-mono">
                    {referralLink}
                  </span>
                </div>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] shrink-0"
                >
                  {copied ? (
                    <Check size={14} className="text-primary" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 animate-fade-in-up stagger-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Just locked in early access to @getfrugal — AI API cost management that actually works. Get 25% off at launch: ${referralLink}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all duration-200 text-xs font-medium text-foreground/80 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all duration-200 text-xs font-medium text-foreground/80 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
