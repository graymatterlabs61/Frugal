"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User, Bell, Shield, Trash2 } from "lucide-react";

interface SettingsFormProps {
  userName: string;
  userEmail: string;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-white/10"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  );
}

export function SettingsForm({ userName, userEmail }: SettingsFormProps) {
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Profile</h3>
        </div>
        <form className="p-5 space-y-4" onSubmit={handleSaveProfile}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input/30 border-border/40 h-10 rounded-xl"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <Input
              value={userEmail}
              disabled
              className="bg-input/10 border-border/20 h-10 rounded-xl opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-5 text-sm font-semibold"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Notifications */}
      <section className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Email alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receive budget and spend alerts via email
              </p>
            </div>
            <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email alerts" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Slack notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send alerts to a Slack webhook URL
              </p>
            </div>
            <Toggle checked={slackAlerts} onChange={setSlackAlerts} label="Slack notifications" />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Security</h3>
        </div>
        <form className="p-5 space-y-4" onSubmit={handleChangePassword}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-input/30 border-border/40 h-10 rounded-xl"
              showStrength
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="bg-input/30 border-border/40 h-10 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={changingPassword || !newPassword}
            variant="outline"
            className="rounded-xl h-10 px-5 text-sm font-semibold border-border/40"
          >
            {changingPassword ? "Changing…" : "Change Password"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border border-destructive/30 rounded-2xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-destructive/20 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h3 className="font-semibold text-sm text-destructive">Danger Zone</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 rounded-xl h-9 px-4 text-sm font-semibold shrink-0 ml-4"
              onClick={() =>
                toast.error("Contact support@frugal.so to delete your account")
              }
            >
              Delete Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
