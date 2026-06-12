"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseLogin } from "@/components/auth/ShowcaseLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }
      router.push("/dashboard");
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout showcase={<ShowcaseLogin />}>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Welcome <span className="font-serif italic font-normal gradient-text-warm">back</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm">
            Sign in to your Frugal account.
          </p>
        </div>

        <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="alex@company.com"
              className="bg-white/[0.05] border-white/[0.12] h-12 rounded-xl px-4 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
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
              className="bg-white/[0.05] border-white/[0.12] h-12 rounded-xl px-4 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-md font-semibold mt-2 bg-primary hover:bg-primary/90 text-white btn-glow"
          >
            {loading ? "Signing in…" : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="flex items-center gap-4 py-2">
          <span className="flex-1 border-t border-border/50" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
            Or continue with
          </span>
          <span className="flex-1 border-t border-border/50" />
        </div>

        <Button
          variant="outline"
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 font-semibold text-sm transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="text-center pt-2">
          <p className="text-muted-foreground text-sm">
            New to Frugal?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
