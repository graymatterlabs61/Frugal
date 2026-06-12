import { redirect } from "next/navigation";
import { auth } from "./index";

export interface AuthSession {
  id: string;
  email: string;
  backendToken: string | undefined;
}

export async function requireSession(): Promise<AuthSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    backendToken: session.backendToken,
  };
}
