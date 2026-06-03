import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseForgotPassword } from "@/components/auth/ShowcaseForgotPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <AuthLayout showcase={<ShowcaseForgotPassword />}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="font-serif text-5xl italic mb-3">Set new password</h1>
          <p className="text-muted-foreground text-lg max-w-xs">
            Please enter a strong password for your Frugal account.
          </p>
        </div>

        <form className="space-y-6 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <span className="text-[10px] font-mono tracking-wider opacity-50 uppercase">
                Min. 8 characters
              </span>
            </div>
            <Input
              type="password"
              placeholder="Enter New Password"
              className="bg-input/30 border-border/40 h-12 rounded-xl px-4 font-mono text-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="Confirm New Password"
              className="bg-input/30 border-border/40 h-12 rounded-xl px-4 font-mono text-lg"
            />
          </div>

          <Button type="button" className="w-full h-12 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 text-white">
            Update Password
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center pt-2 pb-6">
          <Link href="/login" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
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
