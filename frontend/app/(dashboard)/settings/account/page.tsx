import { requireSession } from "@/lib/auth/session";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const session = await requireSession();

  const userName = session.email.split("@")[0] ?? "";
  const userEmail = session.email;
  const plan = "free"; // plan comes from Express backend; safe default

  return <AccountClient userName={userName} userEmail={userEmail} plan={plan} />;
}
