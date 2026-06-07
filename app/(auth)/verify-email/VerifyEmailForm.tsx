"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });
      if (error) throw error;
      toast.success("Email verified!");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast.success("Code resent — check your inbox");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="font-playwrite text-5xl mb-3">Check your email</h1>
        <p className="text-muted-foreground text-lg max-w-sm">
          We sent a 6-digit code to <br />
          <span className="text-foreground font-semibold underline decoration-border underline-offset-4">
            {email || "your email"}
          </span>
        </p>
      </div>

      <form className="space-y-8 pt-2" onSubmit={handleVerify}>
        <div className="flex gap-3">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="gap-3"
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot
                index={0}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
              <InputOTPSlot
                index={1}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
              <InputOTPSlot
                index={2}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
              <InputOTPSlot
                index={3}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
              <InputOTPSlot
                index={4}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
              <InputOTPSlot
                index={5}
                className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono"
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full h-12 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 text-white max-w-[390px]"
        >
          {loading ? "Verifying…" : "Verify Email"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>

      <div className="text-center pt-2 max-w-[390px]">
        <p className="text-muted-foreground text-sm mb-3">Didn&apos;t receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center text-xs font-bold font-mono tracking-wider text-primary hover:text-primary/80 uppercase transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          {resending ? "Sending…" : "Resend Code"}
        </button>
      </div>

      <div className="pt-8 border-t border-border/20 max-w-[390px]">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
