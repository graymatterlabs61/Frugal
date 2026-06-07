"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { Shield, Laptop, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SecurityClient() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const glassCard: React.CSSProperties = {
    background:
      "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid oklch(1 0 0 / 0.10)",
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Minimum 8 characters");
      return;
    }
    setChanging(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Change password */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-white/[0.06] border-white/[0.1] h-10 rounded-xl"
                showStrength
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/[0.06] border-white/[0.1] h-10 rounded-xl"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={changing || !newPassword}
            variant="outline"
            className="rounded-xl h-9 px-4 text-sm border-white/[0.1]"
          >
            {changing ? "Updating…" : "Update Password"}
          </Button>
        </form>
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
              toast.error("Contact support@frugal.so to delete your account")
            }
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
