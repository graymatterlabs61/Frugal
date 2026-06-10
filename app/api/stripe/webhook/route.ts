import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { sendSubscriptionUpgraded, sendSubscriptionCancelled } from "@/lib/email";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// REQUIRED: Edge runtime re-encodes the body, breaking Stripe signature verification
export const runtime = "nodejs";

export async function POST(request: Request) {
  // REQUIRED: Must use text(), not json() — same reason as runtime above
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Service role client required — webhook has no user session, RLS would block users UPDATE
  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // session.subscription is a string ID — must retrieve to get price details
        if (!session.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) break;

        const plan = getPlanFromPriceId(priceId);
        const supabaseUserId = session.metadata?.supabase_user_id;
        if (!supabaseUserId) break;

        const { data: updatedUser } = await supabase
          .from("users")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", supabaseUserId)
          .select("email, full_name")
          .single();

        if (updatedUser?.email) {
          const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
          const periodEnd = itemPeriodEnd
            ? new Date(itemPeriodEnd * 1000).toISOString()
            : undefined;
          sendSubscriptionUpgraded(updatedUser.email, {
            userName: updatedUser.full_name ?? updatedUser.email,
            plan,
            periodEnd,
          }).catch((err) => console.error("[webhook] upgrade email failed:", err));
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) break;

        const plan = getPlanFromPriceId(priceId);
        // Look up user by stripe_customer_id — no supabase_user_id on sub update events
        await supabase
          .from("users")
          .update({ plan })
          .eq("stripe_customer_id", subscription.customer as string);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
        const periodEnd = itemPeriodEnd
          ? new Date(itemPeriodEnd * 1000).toISOString()
          : new Date().toISOString();

        const { data: cancelledUser } = await supabase
          .from("users")
          .update({ plan: "free" })
          .eq("stripe_customer_id", subscription.customer as string)
          .select("email, full_name")
          .single();

        if (cancelledUser?.email) {
          sendSubscriptionCancelled(cancelledUser.email, {
            userName: cancelledUser.full_name ?? cancelledUser.email,
            periodEnd,
          }).catch((err) => console.error("[webhook] cancellation email failed:", err));
        }
        break;
      }

      default:
        // Unhandled event types — return 200 so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
