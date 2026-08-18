"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseVerifyEmail } from "@/components/auth/ShowcaseVerifyEmail";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (value: string) => {
    if (!email) {
      toast.error("Missing email address — start from the sign-up page.");
      return;
    }
    setVerifying(true);
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: value });
    if (error) {
      // The code is wrong or expired. Clear it so the next attempt starts from
      // an empty field rather than the user editing a stale value.
      setCode("");
      toast.error(error.message ?? "That code isn't valid. Check it and try again.");
      setVerifying(false);
      return;
    }
    toast.success("Email verified.");
    router.push("/dashboard");
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    if (error) {
      toast.error("Couldn't send a new code. Try again in a moment.");
    } else {
      toast.success("New code sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
    setResending(false);
  };

  return (
    <AuthLayout showcase={<ShowcaseVerifyEmail />}>
      <div className="flex flex-col space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Enter your{" "}
            <span className="font-serif italic font-normal gradient-text-warm">code</span>
          </h1>
          <p className="text-muted-foreground">
            {email ? (
              <>
                We sent a {CODE_LENGTH}-digit code to{" "}
                <span className="text-foreground font-medium">{email}</span>. It
                expires in 5 minutes.
              </>
            ) : (
              `Enter the ${CODE_LENGTH}-digit code we emailed you.`
            )}
          </p>
        </div>

        <div className="animate-fade-in-up stagger-1">
          <InputOTP
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(v) => {
              setCode(v);
              // Submit as soon as the last digit lands — nobody wants to type
              // six digits and then hunt for a button.
              if (v.length === CODE_LENGTH) void submit(v);
            }}
            disabled={verifying}
            autoFocus
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-xl border-white/[0.10] bg-white/[0.05] text-lg font-semibold"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="button"
          onClick={() => submit(code)}
          disabled={verifying || code.length !== CODE_LENGTH}
          className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white btn-glow shadow-[0_4px_24px_rgba(255,80,11,0.3)] animate-fade-in-up stagger-2"
        >
          {verifying ? "Verifying…" : "Verify email"}
        </Button>

        <div className="flex flex-col gap-3 animate-fade-in-up stagger-3">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !email}
            className="h-11 rounded-xl border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.18] text-sm transition-all duration-200"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Send a new code
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
            Check your spam folder if it doesn&apos;t arrive within a minute.
          </p>
        </div>

        <p className="text-center animate-fade-in-up stagger-4">
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
