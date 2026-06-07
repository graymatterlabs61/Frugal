import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user plan and Stripe customer ID from DB
  const { data: userData } = await supabase
    .from("users")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const currentPlan = (userData?.plan ?? "free") as "free" | "starter" | "pro";
  const stripeCustomerId = userData?.stripe_customer_id ?? null;

  // Fetch real invoices from Stripe if user has a customer record
  let invoices: Stripe.Invoice[] = [];
  if (stripeCustomerId) {
    const result = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 24,
    });
    invoices = result.data;
  }

  const priceIds = {
    starterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
    starterYearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
    proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    proYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  };

  // Serialize only the fields BillingClient needs (avoid passing full Stripe objects to client)
  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id ?? "",
    amount_paid: inv.amount_paid,
    status: inv.status ?? "unknown",
    hosted_invoice_url: inv.hosted_invoice_url ?? null,
    invoice_pdf: inv.invoice_pdf ?? null,
    created: inv.created,
    period_start:
      (inv as { period_start?: number }).period_start ?? inv.created,
    period_end: (inv as { period_end?: number }).period_end ?? inv.created,
    currency: inv.currency,
  }));

  return (
    <BillingClient
      currentPlan={currentPlan}
      hasStripeCustomer={!!stripeCustomerId}
      invoices={serializedInvoices}
      priceIds={priceIds}
    />
  );
}
