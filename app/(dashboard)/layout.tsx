import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName: string = (user.user_metadata?.full_name as string | undefined) ?? "";
  const userEmail: string = user.email ?? "";

  return (
    <DashboardShell userName={userName} userEmail={userEmail}>
      {children}
    </DashboardShell>
  );
}
