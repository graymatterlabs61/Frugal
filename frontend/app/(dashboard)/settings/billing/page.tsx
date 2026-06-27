import { requireSession } from "@/lib/auth/session";
import { apiClient } from "@/lib/api";
import { staticPlans } from "@/lib/data/plans";
import { PLAN_LIMITS } from "@/lib/tier";
import type { Invoice } from "@/lib/queries/billing";
import type { UsageData } from "@/lib/queries/billing";
import BillingClient from "./BillingClient";

interface StripeInvoice {
  id: string;
  created: number;
  description: string | null;
  amount_due: number;
  currency: string;
  status: string | null;
  invoice_pdf: string | null;
  lines?: { data?: Array<{ description?: string | null }> };
}

function mapInvoice(inv: StripeInvoice): Invoice {
  return {
    id: inv.id,
    date: inv.created,
    description:
      inv.description ??
      inv.lines?.data?.[0]?.description ??
      "Frugal Subscription",
    amount: inv.amount_due,
    currency: inv.currency,
    status: inv.status ?? "unknown",
    pdfUrl: inv.invoice_pdf ?? null,
  };
}

export default async function BillingPage() {
  const session = await requireSession();
  const token = undefined;

  let currentPlan = session.plan ?? "free";
  let hasStripeCustomer = false;

  try {
    const data = await apiClient.get<{
      user: { plan: string; stripeCustomerId: string | null };
    }>("/api/v1/auth/me", token);
    currentPlan = data.user.plan ?? currentPlan;
    hasStripeCustomer = !!data.user.stripeCustomerId;
  } catch {
    // fall through — use session plan
  }

  const invoicesResult = await apiClient
    .get<{ invoices: StripeInvoice[] }>("/api/v1/billing/invoices", token)
    .catch(() => null);

  const invoices: Invoice[] = (invoicesResult?.invoices ?? []).map(mapInvoice);

  // Derive usage from plan limits
  const planKey = currentPlan as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey] ?? PLAN_LIMITS.free;
  const usage: UsageData = {
    connections: 0,
    projects: 0,
    limits: {
      connections: limits.connections === Infinity ? -1 : limits.connections,
      projects: limits.projects === Infinity ? -1 : limits.projects,
    },
    plan: currentPlan,
  };

  return (
    <BillingClient
      currentPlan={currentPlan}
      hasStripeCustomer={hasStripeCustomer}
      plans={staticPlans}
      invoices={invoices}
      usage={usage}
      paymentMethod={null}
    />
  );
}
