"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/use-session";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FolderPlus } from "lucide-react";
import { getProjectLimit } from "@/lib/tier";
import { apiClient } from "@/lib/api/client";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
}

const colorMap: Record<string, string> = {
  slate: "bg-slate-500/10 text-slate-400",
  blue: "bg-blue-500/10 text-blue-400",
  green: "bg-emerald-500/10 text-emerald-400",
  teal: "bg-teal-500/10 text-teal-400",
  orange: "bg-orange-500/10 text-orange-400",
  red: "bg-red-500/10 text-red-400",
};

const COLOR_OPTIONS = [
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
];

function CreateProjectDialog({
  onCreated,
  disabled = false,
  token,
}: {
  onCreated: (p: Project) => void;
  disabled?: boolean;
  token?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("slate");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name required");
      return;
    }
    setLoading(true);
    try {
      const result = await apiClient.post<{ project: Project }>("/api/v1/projects", {
        name: name.trim(),
        description: description || undefined,
        color,
      }, token);
      onCreated(result.project);
      toast.success("Project created");
      setOpen(false);
      setName("");
      setDescription("");
      setColor("slate");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create project",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. prod-api"
              className="bg-input/30 border-border/40 h-10 rounded-xl font-mono"
              maxLength={64}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Description{" "}
              <span className="normal-case font-normal text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project do?"
              className="bg-input/30 border-border/40 h-10 rounded-xl"
              maxLength={256}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    colorMap[c.value]
                  } ${
                    color === c.value
                      ? "ring-2 ring-primary border-primary/40"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
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
              {loading ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const { user } = useSession();
  const router = useRouter();
  const token = undefined;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const userPlan = user?.user_metadata?.plan ?? "free";

  useEffect(() => {
    if (token === undefined) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await apiClient.get<{ projects: Project[] }>("/api/v1/projects", token);
        if (!cancelled) setProjects(result.projects ?? []);
      } catch {
        if (!cancelled) toast.error("Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const projLimit = getProjectLimit(userPlan);
  const atProjLimit = projects.length >= projLimit;

  const handleCreated = (p: Project) => {
    setProjects((prev) => [p, ...prev]);
    router.push(`/projects/${p.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/v1/projects/${id}`, token);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <p className="section-eyebrow">Workspace</p>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API connections and monitor spend per project.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <CreateProjectDialog onCreated={handleCreated} disabled={atProjLimit} token={token} />
          <span className="text-xs text-muted-foreground font-mono">
            {loading
              ? "…"
              : `${projects.length} / ${projLimit === Infinity ? "∞" : projLimit} projects`}
          </span>
          {atProjLimit && !loading && (
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

      {loading ? (
        <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-white/[0.05] last:border-0">
              <div className="w-3 h-3 rounded-full bg-white/[0.08] shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-2.5 w-48 bg-white/[0.04] rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-20 bg-white/[0.04] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center animate-fade-in-up stagger-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-6 h-6 text-primary" />
          </div>
          <p className="font-semibold text-sm">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1.5 mb-5 max-w-[260px] mx-auto leading-relaxed">
            Projects group your API connections and give each app its own budget rules.
          </p>
          <CreateProjectDialog onCreated={handleCreated} disabled={atProjLimit} token={token} />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
          {projects.map((project) => {
            const dotColorMap: Record<string, string> = {
              slate: "bg-slate-400",
              blue: "bg-blue-400",
              green: "bg-emerald-400",
              teal: "bg-teal-400",
              orange: "bg-orange-400",
              red: "bg-red-400",
            };
            const dot = dotColorMap[project.color ?? "slate"] ?? dotColorMap.slate;
            return (
              <div
                key={project.id}
                className="relative group flex items-center border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025] transition-colors"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-4 flex-1 min-w-0"
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm font-mono truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/60 shrink-0 font-mono">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Link>

                <div className="pr-3 shrink-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        aria-label={`Delete project ${project.name}`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete project"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{project.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Budget rules for this project are removed and its
                          connections become unassigned. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id)}
                          className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
