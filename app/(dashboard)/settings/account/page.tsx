import { createClient } from "@/lib/supabase/server";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const userEmail = user?.email ?? "";

  return <AccountClient userName={userName} userEmail={userEmail} />;
}
