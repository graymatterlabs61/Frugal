import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseVerifyEmail } from "@/components/auth/ShowcaseVerifyEmail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyEmailPage() {
  return (
    <AuthLayout showcase={<ShowcaseVerifyEmail />}>
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="font-playwrite text-5xl mb-3">Check your email</h1>
          <p className="text-muted-foreground text-lg max-w-sm">
            We sent a 6-digit code to <br/>
            <span className="text-foreground font-semibold underline decoration-border underline-offset-4">alexander.v@frugal.ai</span>
          </p>
        </div>

        <form className="space-y-8 pt-2">
          {/* Using custom styling for OTP to match the dark boxes with faint borders */}
          <div className="flex gap-3">
            <InputOTP maxLength={6} containerClassName="gap-3">
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
                <InputOTPSlot index={1} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
                <InputOTPSlot index={2} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
                <InputOTPSlot index={3} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
                <InputOTPSlot index={4} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
                <InputOTPSlot index={5} className="w-14 h-14 rounded-xl border-border/40 bg-input/20 text-xl font-bold font-mono" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="button" className="w-full h-12 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 text-white max-w-[390px]">
            Verify Email
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center pt-2 max-w-[390px]">
          <p className="text-muted-foreground text-sm mb-3">Didn't receive the code?</p>
          <button className="inline-flex items-center text-xs font-bold font-mono tracking-wider text-primary hover:text-primary/80 uppercase transition-colors">
            <RotateCcw className="w-3 h-3 mr-2" />
            Resend Code
          </button>
        </div>

        <div className="pt-8 border-t border-border/20 max-w-[390px]">
          <Link href="/login" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
