import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  priceId: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { priceId } = parsed.data;

  // Fetch user's existing stripe_customer_id if any
  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripeCustomerId = userData?.stripe_customer_id ?? undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    // Reuse existing Stripe customer or let Stripe create one via email
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : user.email ?? undefined,
    customer_creation: stripeCustomerId ? undefined : "always",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    // Both metadata paths needed: session metadata for checkout.session.completed,
    // subscription_data.metadata for customer.subscription.* events
    metadata: { supabase_user_id: user.id },
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  return NextResponse.json({ url: session.url });
}
