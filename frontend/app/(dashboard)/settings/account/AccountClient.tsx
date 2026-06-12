"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Crown } from "lucide-react";

interface Props {
  userName: string;
  userEmail: string;
  plan: string;
}

function planLabel(p: string): string {
  if (p === "plus") return "Plus";
  if (p === "pro") return "Pro";
  if (p === "corp_starter") return "Starter";
  if (p === "corp_growth") return "Growth";
  if (p === "corp_scale") return "Scale";
  if (p === "enterprise") return "Enterprise";
  return "Free";
}

export function AccountClient({ userName, userEmail, plan }: Props) {
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const displayPlan = planLabel(plan);
  const initial = (name || userEmail || "U")[0].toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to save");
      }
      toast.success("Profile saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl mx-auto">
      {/* Avatar card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{
          background:
            "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary shrink-0 select-none">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">{name || "User"}</p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {userEmail}
          </p>
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-white/5 border border-border text-muted-foreground">
            <Crown className="w-2.5 h-2.5" />
            {displayPlan} Plan
          </span>
        </div>
      </div>

      {/* Personal info */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid oklch(1 0 0 / 0.1)",
        }}
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Personal Information</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-white/[0.06] border-white/[0.1] h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input
                  value={userEmail}
                  disabled
                  className="bg-white/[0.03] border-white/[0.06] h-10 rounded-xl pl-9 opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if needed.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={saving}
              className="bg-foreground hover:bg-foreground/90 text-background rounded-xl h-9 px-5 text-sm font-semibold"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-9 px-4 text-sm border-white/[0.1]"
              onClick={() => {
                setName(userName);
                toast.info("Changes discarded");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
