import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireSession } from "@/lib/auth/session";
import {
  getProjectStats,
  getProjectConnections,
  getProjectAlerts,
} from "@/lib/queries/dashboard";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const token = undefined;
  const { id } = await params;

  const [project, connections, alerts] = await Promise.all([
    getProjectStats(id, token),
    getProjectConnections(id, token),
    getProjectAlerts(id, 20, token),
  ]);

  if (project === null) {
    return (
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
        <div className="border border-border rounded-2xl p-12 text-center bg-card">
          <p className="text-muted-foreground">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetailClient
      project={project}
      connections={connections}
      alerts={alerts}
      userPlan={session.plan ?? "free"}
    />
  );
}
