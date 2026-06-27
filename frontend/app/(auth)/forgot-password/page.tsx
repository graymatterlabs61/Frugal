"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseForgotPassword } from "@/components/auth/ShowcaseForgotPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Request failed");
      }
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
      toast.info("If that email exists, a reset link is on its way.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showcase={<ShowcaseForgotPassword />}>
      <div className="flex flex-col space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Reset <span className="font-serif italic font-normal gradient-text-warm">password</span>
          </h1>
          <p className="text-muted-foreground">
            {sent
              ? "Check your inbox — if that email is registered, a reset link is on its way."
              : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        {!sent ? (
          <form className="space-y-4 animate-fade-in-up stagger-1" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Email
              </label>
              <Input
                type="email"
                placeholder="alex@company.com"
                className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold mt-1 bg-primary hover:bg-primary/90 text-white btn-glow shadow-[0_4px_24px_rgba(255,80,11,0.3)]"
            >
              {loading ? "Sending…" : "Send reset link"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          </form>
        ) : (
          <div className="animate-fade-in-up stagger-1">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
              <p className="text-sm text-emerald-400 font-semibold">Reset link sent</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check your spam folder if it doesn't arrive within a minute.
              </p>
            </div>
          </div>
        )}

        <p className="text-center animate-fade-in-up stagger-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
