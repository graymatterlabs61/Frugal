import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();
  const userPlan = userData?.plan ?? "free";

  const [project, connections, alerts] = await Promise.all([
    getProjectStats(supabase, user.id, id),
    getProjectConnections(supabase, user.id, id),
    getProjectAlerts(supabase, user.id, id, 20),
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
