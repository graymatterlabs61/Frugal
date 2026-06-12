"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { getConnectionLimit } from "@/lib/tier";
import {
  OpenAI,
  Anthropic,
  Replicate,
  Fal,
  Gemini,
  Groq,
  Mistral,
  Together,
  Cohere,
  Perplexity,
  DeepSeek,
  Stability,
} from "@lobehub/icons";
import {
  Plus,
  Trash,
  ArrowClockwise,
  Warning,
  CheckCircle,
  XCircle,
  Lock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Status = "active" | "polling_error" | "invalid" | "blocked";

interface Project {
  id: string;
  name: string;
}

interface Connection {
  id: string;
  provider: string;
  api_key_suffix: string | null;
  status: Status;
  last_polled_at: string | null;
  project_id: string | null;
  projects: Project | null;
  label: string | null;
  created_at: string;
}

// ── Provider config ────────────────────────────────────────────
interface ProviderMeta {
  label: string;
  hint: string;
  bg: string;
  // Shown under the key input — how to mint the least-privileged key for this provider
  keyAdvice?: string;
  // renderIcon: renders the badge icon (Color or Mono with brand color)
  renderIcon: () => React.ReactNode;
  // renderOption: compact version for the dropdown
  renderOption: () => React.ReactNode;
}

const providerMeta: Record<string, ProviderMeta> = {
  openai: {
    label: "OpenAI",
    hint: "sk-…",
    keyAdvice:
      "Best practice: create a dedicated read-only Admin key (scope: api.usage.read) in the OpenAI console. It can read usage data but can never call models or spend money — don't paste your production key.",
    bg: "bg-[#10a37f]/10",
    renderIcon: () => <OpenAI size={22} color="#10a37f" />,
    renderOption: () => <OpenAI size={16} color="#10a37f" />,
  },
  anthropic: {
    label: "Anthropic",
    hint: "sk-ant-…",
    keyAdvice:
      "Usage data requires an Admin key (sk-ant-admin…) from the Anthropic console. Note: Anthropic admin keys can manage your organization — create one dedicated to Frugal and rotate it periodically. A standard key works for connection-health checks only.",
    bg: "bg-[#d97706]/10",
    renderIcon: () => <Anthropic size={22} color="#d97706" />,
    renderOption: () => <Anthropic size={16} color="#d97706" />,
  },
  gemini: {
    label: "Google Gemini",
    hint: "AIza…",
    bg: "bg-blue-500/10",
    renderIcon: () => <Gemini.Color size={22} />,
    renderOption: () => <Gemini.Color size={16} />,
  },
  groq: {
    label: "Groq",
    hint: "gsk_…",
    bg: "bg-[#f55036]/10",
    renderIcon: () => <Groq size={22} color="#f55036" />,
    renderOption: () => <Groq size={16} color="#f55036" />,
  },
  mistral: {
    label: "Mistral",
    hint: "…",
    bg: "bg-[#fa520f]/10",
    renderIcon: () => <Mistral.Color size={22} />,
    renderOption: () => <Mistral.Color size={16} />,
  },
  together: {
    label: "Together AI",
    hint: "…",
    bg: "bg-blue-400/10",
    renderIcon: () => <Together size={22} color="#60a5fa" />,
    renderOption: () => <Together size={16} color="#60a5fa" />,
  },
  cohere: {
    label: "Cohere",
    hint: "…",
    bg: "bg-[#39594d]/20",
    renderIcon: () => <Cohere.Color size={22} />,
    renderOption: () => <Cohere.Color size={16} />,
  },
  perplexity: {
    label: "Perplexity",
    hint: "pplx-…",
    bg: "bg-[#22b8cd]/10",
    renderIcon: () => <Perplexity.Color size={22} />,
    renderOption: () => <Perplexity.Color size={16} />,
  },
  deepseek: {
    label: "DeepSeek",
    hint: "sk-…",
    bg: "bg-[#4d6bfe]/10",
    renderIcon: () => <DeepSeek.Color size={22} />,
    renderOption: () => <DeepSeek.Color size={16} />,
  },
  replicate: {
    label: "Replicate",
    hint: "r8_…",
    bg: "bg-[#ea2805]/10",
    renderIcon: () => <Replicate size={22} color="#ea2805" />,
    renderOption: () => <Replicate size={16} color="#ea2805" />,
  },
  falai: {
    label: "fal.ai",
    hint: "key_id:key_secret",
    bg: "bg-[#ec0648]/10",
    renderIcon: () => <Fal.Color size={22} />,
    renderOption: () => <Fal.Color size={16} />,
  },
  stability: {
    label: "Stability AI",
    hint: "sk-…",
    bg: "bg-[#330066]/30",
    renderIcon: () => <Stability.Color size={22} />,
    renderOption: () => <Stability.Color size={16} />,
  },
};

const statusConfig: Record<
  Status,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  polling_error: {
    label: "Polling Error",
    icon: Warning,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  invalid: {
    label: "Invalid Key",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  blocked: {
    label: "Blocked",
    icon: Lock,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AddConnectionDialog({
  projects,
  onAdd,
  disabled = false,
}: {
  projects: Project[];
  onAdd: (c: Connection) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !apiKey) {
      toast.error("Provider and API key required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          projectId: projectId || null,
          label: label || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to connect");
      onAdd(json.connection as Connection);
      toast.success(`${providerMeta[provider]?.label ?? provider} connected`);
      void confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#FF500B", "#ff8c5a", "#ffffff"] });
      setOpen(false);
      setProvider("");
      setApiKey("");
      setProjectId("");
      setLabel("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const selectedMeta = provider ? providerMeta[provider] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={16} className="mr-1.5" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add API Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Provider
            </label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="bg-input/30 border-border/40 h-10 rounded-xl">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {Object.entries(providerMeta).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {meta.renderOption()}
                      <span className="font-semibold text-sm">{meta.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={selectedMeta ? selectedMeta.hint : "Paste your API key"}
              className="bg-input/30 border-border/40 h-10 rounded-xl font-mono"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              AES-256 encrypted before storage. Never logged or returned after save.
            </p>
            {selectedMeta?.keyAdvice && (
              <p className="rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {selectedMeta.keyAdvice}
              </p>
            )}
          </div>

          {projects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Project{" "}
                <span className="normal-case font-normal text-muted-foreground/60">
                  (optional)
                </span>
              </label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-input/30 border-border/40 h-10 rounded-xl">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Label{" "}
              <span className="normal-case font-normal text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. production key"
              className="bg-input/30 border-border/40 h-10 rounded-xl"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl h-10 border-border/40"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-semibold"
            >
              {loading ? "Validating…" : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan] = useState("free");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [connRes, projRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/projects"),
      ]);
      const [connJson, projJson] = await Promise.all([
        connRes.json() as Promise<{ connections?: Connection[] }>,
        projRes.json() as Promise<{ projects?: Project[] }>,
      ]);
      if (cancelled) return;
      if (connRes.ok) setConnections(connJson.connections ?? []);
      if (projRes.ok) setProjects(projJson.projects ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connLimit = getConnectionLimit(userPlan);
  const atConnLimit = connections.length >= connLimit;

  const handleAdd = (c: Connection) => setConnections((prev) => [c, ...prev]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/connections/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
      toast.success("Connection removed");
    } else {
      toast.error("Failed to remove connection");
    }
  };

  const activeCount = connections.filter((c) => c.status === "active").length;
  const errorCount = connections.filter(
    (c) => c.status === "polling_error" || c.status === "invalid"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Connections</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage provider API keys. Frugal polls usage data every 5 minutes.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AddConnectionDialog projects={projects} onAdd={handleAdd} disabled={atConnLimit} />
          <span className="text-xs text-muted-foreground font-mono">
            {loading ? "…" : `${connections.length} / ${connLimit === Infinity ? "∞" : connLimit} connections`}
          </span>
          {atConnLimit && !loading && (
            <p className="text-xs text-muted-foreground">
              Limit reached.{" "}
              <Link href="/settings/billing" className="text-primary underline">
                Upgrade
              </Link>{" "}
              for more.
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel card-lift rounded-2xl p-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Total
          </p>
          <p className="text-3xl font-bold font-mono">{loading ? "—" : connections.length}</p>
        </div>
        <div className="glass-panel card-lift rounded-2xl p-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Active
          </p>
          <p className="text-3xl font-bold font-mono text-emerald-400">
            {loading ? "—" : activeCount}
          </p>
        </div>
        <div className="glass-panel card-lift rounded-2xl p-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Errors
          </p>
          <p
            className={`text-3xl font-bold font-mono ${!loading && errorCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {loading ? "—" : errorCount}
          </p>
        </div>
      </div>

      {/* Connection list */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Connected Providers</h3>
          <span className="text-xs text-muted-foreground font-mono">
            {loading
              ? "…"
              : `${connections.length} connection${connections.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center">
            <p className="text-muted-foreground text-sm">Loading connections…</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-muted-foreground text-sm">No connections yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add your first API key to start tracking spend.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {connections.map((conn) => {
              const meta = providerMeta[conn.provider];
              const status = statusConfig[conn.status] ?? statusConfig.active;
              const StatusIcon = status.icon;
              const suffix = conn.api_key_suffix ?? "????";

              return (
                <div
                  key={conn.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors group"
                >
                  {/* Provider icon badge */}
                  <div
                    className={`w-10 h-10 rounded-xl ${meta?.bg ?? "bg-white/5"} flex items-center justify-center shrink-0`}
                  >
                    {meta ? (
                      meta.renderIcon()
                    ) : (
                      <span className="text-xs font-bold font-mono text-muted-foreground">
                        {conn.provider.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm">
                        {meta?.label ?? conn.provider}
                      </span>
                      {conn.label && (
                        <span className="text-xs text-muted-foreground">
                          {conn.label}
                        </span>
                      )}
                      <span className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">
                        ••••••••{suffix}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}
                      >
                        <StatusIcon size={10} weight="fill" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowClockwise size={11} />
                        {formatRelativeTime(conn.last_polled_at)}
                      </span>
                      {conn.projects?.name && (
                        <span className="bg-white/5 px-2 py-0.5 rounded-md">
                          {conn.projects.name}
                        </span>
                      )}
                      <span>
                        Added{" "}
                        {new Date(conn.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        aria-label={`Remove ${meta?.label ?? conn.provider} connection`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Remove connection"
                      >
                        <Trash size={15} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remove {meta?.label ?? conn.provider} connection?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Polling stops immediately and the encrypted key is deleted
                          from Frugal. Usage history already collected is kept. This
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(conn.id)}
                          className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
                        >
                          Remove connection
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="border border-dashed border-border/50 rounded-2xl p-5 flex items-start gap-4 bg-white/1">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Lock size={16} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Keys are encrypted at rest</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
            API keys are AES-256 encrypted before storage. Only the last 4 characters
            are stored in plaintext for display. Keys are never logged, returned after
            save, or used to make model requests — only to read usage data.
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-lg">
            Tip: where your provider supports it (OpenAI does), connect a dedicated
            read-only usage key instead of a production key — then a leak anywhere
            can read stats, never spend money.
          </p>
        </div>
      </div>
    </div>
  );
}
