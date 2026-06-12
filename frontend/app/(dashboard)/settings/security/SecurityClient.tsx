"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Laptop, Trash2, Mail } from "lucide-react";

export function SecurityClient() {
  const glassCard: React.CSSProperties = {
    background:
      "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid oklch(1 0 0 / 0.10)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Sign-in method */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Sign-in Method</h3>
        </div>
        <div className="p-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Magic Link (passwordless)</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              You sign in via a secure link sent to your email — no password
              needed. Each link is single-use and expires in 10 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Laptop className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Active Sessions</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold">Current session</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browser &middot;{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.65 0.22 25 / 0.06) 0%, oklch(0.65 0.22 25 / 0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid oklch(0.65 0.22 25 / 0.25)",
        }}
      >
        <div className="px-5 py-4 border-b border-destructive/20 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h3 className="font-semibold text-sm text-destructive">Danger Zone</h3>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              Permanently delete your account and all data. Cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 rounded-xl h-9 px-4 text-sm shrink-0"
            onClick={() =>
              toast.error(
                "Contact support@getfrugal.dev to delete your account",
              )
            }
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
