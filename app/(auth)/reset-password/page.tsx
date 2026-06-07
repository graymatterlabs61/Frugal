"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseForgotPassword } from "@/components/auth/ShowcaseForgotPassword";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showcase={<ShowcaseForgotPassword />}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="font-playwrite text-5xl mb-3">Set new password</h1>
          <p className="text-muted-foreground text-lg max-w-xs">
            Please enter a strong password for your Frugal account.
          </p>
        </div>

        <form className="space-y-6 pt-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <span className="text-[10px] font-mono tracking-wider opacity-50 uppercase">
                Min. 8 characters
              </span>
            </div>
            <PasswordInput
              placeholder="Enter New Password"
              className="bg-input/30 border-border/40 h-12 rounded-xl px-4 font-mono text-lg"
              showStrength
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <PasswordInput
              placeholder="Confirm New Password"
              className="bg-input/30 border-border/40 h-12 rounded-xl px-4 font-mono text-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-md font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? "Updating…" : "Update Password"}
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
