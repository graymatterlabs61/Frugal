import { requireSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  const userName = session.email.split("@")[0] ?? "";
  const userEmail = session.email;

  return (
    <DashboardShell userName={userName} userEmail={userEmail}>
      {children}
    </DashboardShell>
  );
}
