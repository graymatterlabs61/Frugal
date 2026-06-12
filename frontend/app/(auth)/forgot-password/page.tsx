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
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Reset <span className="font-serif italic font-normal gradient-text-warm">password</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm">
            {sent
              ? "Check your inbox — if that email is registered, a reset link is on its way."
              : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        {!sent ? (
          <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="alex@company.com"
                className="bg-white/[0.05] border-white/[0.12] h-12 rounded-xl px-4 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-md font-semibold mt-2 bg-primary hover:bg-primary/90 text-white btn-glow"
            >
              {loading ? "Sending…" : "Send Reset Link"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        ) : (
          <div className="pt-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
              <p className="text-sm text-emerald-400 font-semibold">Reset link sent</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check your spam folder if it doesn't arrive within a minute.
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
