"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseLogin } from "@/components/auth/ShowcaseLogin";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      // An unverified account fails sign-in with its own code. Saying "invalid
      // password" there sends people to reset a password that was fine.
      if (error.status === 403 || error.code === 'EMAIL_NOT_VERIFIED') {
        toast.info("Check your inbox — verify your email to finish signing in.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setAuthError("Invalid email or password");
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
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
    <AuthLayout showcase={<ShowcaseLogin />}>
      <div className="flex flex-col space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome{" "}
            <span className="font-serif italic font-normal gradient-text-warm">
              back
            </span>
          </h1>
          <p className="text-muted-foreground">Sign in to your Frugal account.</p>
        </div>

        <form
          className="space-y-4 animate-fade-in-up stagger-1"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Email
            </label>
            <Input
              type="email"
              placeholder="alex@company.com"
              className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              className="input-focus-glow bg-white/[0.05] border-white/[0.10] h-12 rounded-xl px-4 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {authError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {authError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold mt-1 bg-primary hover:bg-primary/90 text-white btn-glow shadow-[0_4px_24px_rgba(255,80,11,0.3)]"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
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
          New to Frugal?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
