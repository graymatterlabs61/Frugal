import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireSession } from "@/lib/auth/session";
import {
  getProjectStats,
  getProjectConnections,
  getProjectAlerts,
} from "@/lib/queries/dashboard";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  const hdrs = await headers();
  const cookieHeader = hdrs.get("cookie") ?? "";
  const jwt = await getToken({
    req: { headers: { cookie: cookieHeader } } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET!,
  });
  const token = jwt?.sub ? (jwt as { accessToken?: string }).accessToken ?? undefined : undefined;

  const { id } = await params;

  const userPlan = "free"; // plan comes from Express backend; default for display

  const [project, connections, alerts] = await Promise.all([
    getProjectStats(session.id, id, token),
    getProjectConnections(session.id, id, token),
    getProjectAlerts(session.id, id, 20, token),
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
      userPlan={userPlan}
    />
  );
}
