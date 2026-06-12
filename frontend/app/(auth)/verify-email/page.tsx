"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseVerifyEmail } from "@/components/auth/ShowcaseVerifyEmail";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend");
      setResent(true);
      toast.success("Verification email resent!");
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout showcase={<ShowcaseVerifyEmail />}>
      <div className="flex flex-col space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Mail className="w-7 h-7 text-primary" />
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Check your{" "}
            <span className="font-serif italic font-normal gradient-text-warm">inbox</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm">
            {email ? (
              <>
                We sent a verification link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
              </>
            ) : (
              "We sent a verification link to your email address."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 space-y-3">
          {["Open your email client", "Click the verification link", "You'll land on your dashboard"].map(
            (step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            )
          )}
        </div>

        <p className="text-xs text-muted-foreground/60 text-center">
          Check your spam folder if it doesn&apos;t arrive within a minute.
        </p>

        {email && (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending || resent}
            className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm transition-all duration-200"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : resent ? (
              "Email sent ✓"
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend verification email
              </>
            )}
          </Button>
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
