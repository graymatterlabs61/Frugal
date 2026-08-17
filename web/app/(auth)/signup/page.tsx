"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseSignup } from "@/components/auth/ShowcaseSignup";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: fullName || email,
    });
    if (error) {
      toast.error(error.message ?? "Registration failed");
      setLoading(false);
      return;
    }
    // Sign-up no longer returns a session — the account has to be verified
    // first — so send them to the "check your inbox" screen, not the dashboard.
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
    if (error) {
      toast.error("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout showcase={<ShowcaseSignup />}>
      <div className="flex flex-col space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Create{" "}
            <span className="font-serif italic font-normal gradient-text-warm">
              account
            </span>
          </h1>
          <p className="text-muted-foreground">
            Start tracking your AI spend in minutes.
          </p>
        </div>

        <form
          className="space-y-4 animate-fade-in-up stagger-1"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Alex Chen"
              className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@company.com"
              className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Password
            </label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold mt-1 bg-primary hover:bg-primary/90 text-white btn-glow shadow-[0_4px_24px_rgba(255,80,11,0.3)]"
          >
            {loading ? "Creating account…" : "Get started free"}
            {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>

          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <div className="flex items-center gap-3 animate-fade-in-up stagger-2">
          <span className="flex-1 border-t border-white/[0.08]" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/60">
            or
          </span>
          <span className="flex-1 border-t border-white/[0.08]" />
        </div>

        <GoogleAuthButton loading={googleLoading} onClick={handleGoogle} />

        <p className="text-center text-muted-foreground/70 text-sm animate-fade-in-up stagger-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}
