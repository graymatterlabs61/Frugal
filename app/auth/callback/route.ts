import { createClient } from "@/lib/supabase/server";
import { sendWelcome } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && user.created_at) {
        const ageMs = Date.now() - new Date(user.created_at).getTime();
        if (ageMs < 60_000) {
          // New signup — fire welcome email (don't await; don't block redirect)
          sendWelcome(user.email, {
            userName: user.user_metadata?.full_name ?? user.email,
            userEmail: user.email,
          }).catch((err) => console.error("[auth/callback] welcome email failed:", err));
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
