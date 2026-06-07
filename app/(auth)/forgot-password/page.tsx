"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseForgotPassword } from "@/components/auth/ShowcaseForgotPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout showcase={<ShowcaseForgotPassword />}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-start space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h1 className="font-playwrite text-5xl mb-3">Check your email</h1>
              <p className="text-muted-foreground text-lg max-w-sm">
                We sent a reset link to{" "}
                <span className="text-foreground font-semibold">{email}</span>. Click the link to set a new password.
              </p>
            </div>
          </div>
          <div className="text-center pt-2 pb-6">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-2">
                <ArrowLeft className="w-3 h-3" />
              </div>
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showcase={<ShowcaseForgotPassword />}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="font-playwrite text-5xl mb-3">Reset Password</h1>
          <p className="text-muted-foreground text-lg max-w-xs">
            Enter your email to receive a secure recovery link for your account.
          </p>
        </div>

        <form className="space-y-6 pt-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Work Email
            </label>
            <Input
              type="email"
              placeholder="alex@company.com"
              className="bg-input/30 border-border/40 h-12 rounded-xl px-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? "Sending…" : "Send Reset Link"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="text-center pt-2 pb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-2">
              <ArrowLeft className="w-3 h-3" />
            </div>
            Back to login
          </Link>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase">
            <span className="bg-background px-4 text-muted-foreground">Security Layer</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-xs font-mono tracking-widest text-muted-foreground opacity-70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC2 Type II</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>AES-256</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
