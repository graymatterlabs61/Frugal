import { requireSession } from "@/lib/auth/session";
import { apiClient } from "@/lib/api/client";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const session = await requireSession();
  const token = undefined;

  let userName = session.name ?? session.email.split("@")[0] ?? "";
  let plan = session.plan ?? "free";

  try {
    const data = await apiClient.get<{
      user: { fullName: string | null; plan: string };
    }>("/api/v1/auth/me", token);
    userName = data.user.fullName ?? userName;
    plan = data.user.plan ?? plan;
  } catch {
    // fall through — use session values
  }

  return <AccountClient userName={userName} userEmail={session.email} plan={plan} />;
}
