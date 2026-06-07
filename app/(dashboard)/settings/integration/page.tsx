"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Zap, Copy } from "lucide-react";

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
};

function PlanBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold font-mono uppercase bg-white/5 text-muted-foreground border border-white/[0.08] px-1.5 py-0.5 rounded-md">
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${checked && !disabled ? "bg-primary" : "bg-white/10"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function IntegrationPage() {
  const plan = "Free";
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const apiEndpoints = [
    { method: "GET",  path: "/api/v1/projects" },
    { method: "GET",  path: "/api/v1/projects/:id/spend" },
    { method: "POST", path: "/api/v1/projects/:id/budget-rules" },
    { method: "GET",  path: "/api/v1/usage" },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Programmatic API */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Programmatic API Access</h3>
          </div>
          <PlanBadge label="Pro · V1.1" />
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            REST API for reading spend data and managing budget rules from your own dashboards or CI/CD pipelines.
          </p>
          <div
            className="rounded-xl p-4 font-mono text-xs space-y-2"
            style={{
              background: "oklch(1 0 0 / 0.03)",
              border: "1px solid oklch(1 0 0 / 0.06)",
            }}
          >
            {apiEndpoints.map(({ method, path }) => (
              <p key={path} className="text-muted-foreground">
                <span className="text-primary font-semibold">{method.padEnd(4, " ")}</span>
                {"  "}{path}
              </p>
            ))}
          </div>
          <Button
            variant="outline"
            disabled
            className="rounded-xl h-9 px-4 text-sm border-white/[0.1] opacity-50 cursor-not-allowed"
          >
            Generate API Key — V1.1
          </Button>
        </div>
      </div>

      {/* Slack webhook */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-sm">Slack Webhook</h3>
          <PlanBadge label="Plus / Pro" />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Send budget alerts to Slack</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Posts to your channel via incoming webhook URL
              </p>
            </div>
            <Toggle
              checked={slackEnabled}
              onChange={setSlackEnabled}
              disabled={plan === "Free"}
            />
          </div>
          {slackEnabled && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Webhook URL
              </label>
              <Input
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
                className="bg-white/[0.06] border-white/[0.1] h-10 rounded-xl font-mono text-sm"
              />
            </div>
          )}
          {plan === "Free" && (
            <p className="text-xs text-muted-foreground bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              Upgrade to Plus or Pro to enable Slack alerts.
            </p>
          )}
        </div>
      </div>

      {/* HMAC webhook */}
      <div className="rounded-2xl overflow-hidden" style={glassCard}>
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold text-sm">HMAC Webhook</h3>
          <PlanBadge label="Pro" />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Signed webhook to custom endpoint</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                POST with X-Frugal-Signature header for verification
              </p>
            </div>
            <Toggle
              checked={webhookEnabled}
              onChange={setWebhookEnabled}
              disabled={plan !== "Pro"}
            />
          </div>
          {webhookEnabled && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                  Endpoint URL
                </label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-app.com/webhooks/frugal"
                  className="bg-white/[0.06] border-white/[0.1] h-10 rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                  Signing Secret
                </label>
                <div className="flex gap-2">
                  <Input
                    value="whsec_frugal_••••••••••••••••"
                    disabled
                    className="bg-white/[0.03] border-white/[0.06] h-10 rounded-xl font-mono text-sm opacity-60 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-white/[0.1] shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText("whsec_example");
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
          {plan !== "Pro" && (
            <p className="text-xs text-muted-foreground bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              Upgrade to Pro to enable HMAC webhooks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
