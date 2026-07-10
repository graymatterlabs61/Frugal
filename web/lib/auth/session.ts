import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthSession {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

export async function requireSession(): Promise<AuthSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.full_name as string | null) ?? null,
    plan: (user.user_metadata?.plan as string | null) ?? "free",
  };
}
