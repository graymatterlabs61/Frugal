"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getProjectLimit } from "@/lib/tier";
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
  created_at: string;
}

const colorMap: Record<string, string> = {
  slate: "bg-slate-500/10 text-slate-400",
  blue: "bg-blue-500/10 text-blue-400",
  green: "bg-emerald-500/10 text-emerald-400",
  purple: "bg-purple-500/10 text-purple-400",
  orange: "bg-orange-500/10 text-orange-400",
  red: "bg-red-500/10 text-red-400",
};

const COLOR_OPTIONS = [
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
];

function CreateProjectDialog({
  onCreated,
  disabled = false,
}: {
  onCreated: (p: Project) => void;
  disabled?: boolean;
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
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description || undefined,
          color,
        }),
      });
      const json = await res.json() as { project?: Project; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to create project");
      onCreated(json.project as Project);
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
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
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
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
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
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan] = useState("free");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/projects");
      const json = await res.json() as { projects?: Project[] };
      if (cancelled) return;
      if (res.ok) setProjects(json.projects ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const projLimit = getProjectLimit(userPlan);
  const atProjLimit = projects.length >= projLimit;

  const handleCreated = (p: Project) => setProjects((prev) => [p, ...prev]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API connections and monitor spend per project.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <CreateProjectDialog onCreated={handleCreated} disabled={atProjLimit} />
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
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-sm">Loading projects…</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const colorClass =
              colorMap[project.color ?? "slate"] ?? colorMap.slate;
            return (
              <div key={project.id} className="relative group">
                <Link
                  href={`/projects/${project.id}`}
                  className="glass-panel card-lift rounded-2xl p-5 hover:border-primary/30 hover:bg-primary/2 transition-all duration-150 cursor-pointer block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="font-semibold text-base font-mono truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${colorClass}`}
                    >
                      {project.color ?? "slate"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      aria-label={`Delete project ${project.name}`}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all z-10"
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
            );
          })}

          <div className="border border-dashed border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center hover:border-primary/30 hover:bg-primary/3 transition-all duration-150 min-h-[160px] group">
            <CreateProjectDialog onCreated={handleCreated} disabled={atProjLimit} />
            <p className="text-xs text-muted-foreground mt-1">
              Connect an API key and start tracking
            </p>
          </div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="border border-dashed border-border/50 rounded-2xl p-10 text-center">
          <p className="font-semibold text-sm">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create a project to group API connections and set budget rules.
          </p>
          <CreateProjectDialog onCreated={handleCreated} disabled={atProjLimit} />
        </div>
      )}
    </div>
  );
}
