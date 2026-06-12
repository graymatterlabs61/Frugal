"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseResetPassword } from "@/components/auth/ShowcaseResetPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Reset failed");
      }
      setDone(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout showcase={<ShowcaseResetPassword />}>
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Link{" "}
              <span className="font-serif italic font-normal gradient-text-warm">expired</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-sm">
              This reset link is invalid or has expired. Request a new one.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 h-12 text-sm font-semibold text-white btn-glow w-fit"
          >
            Request new link
            <ArrowRight className="w-4 h-4" />
          </Link>
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

  return (
    <AuthLayout showcase={<ShowcaseResetPassword />}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            New{" "}
            <span className="font-serif italic font-normal gradient-text-warm">password</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm">
            {done
              ? "Your password has been updated."
              : "Choose a strong password for your account."}
          </p>
        </div>

        {!done ? (
          <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                className="bg-white/[0.05] border-white/[0.12] h-12 rounded-xl px-4 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Repeat your password"
                className="bg-white/[0.05] border-white/[0.12] h-12 rounded-xl px-4 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-md font-semibold mt-2 bg-primary hover:bg-primary/90 text-white btn-glow"
            >
              {loading ? "Updating…" : "Set New Password"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        ) : (
          <div className="pt-4 space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
              <p className="text-sm text-emerald-400 font-semibold">Password updated</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 w-full justify-center rounded-xl bg-primary h-12 text-sm font-semibold text-white btn-glow"
            >
              Sign in now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!done && (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
