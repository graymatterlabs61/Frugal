import { requireSession } from "@/lib/auth/session";
import { apiClient, ApiError } from "@/lib/api";
import { fetchPlans } from "@/lib/queries/public";
import type { Invoice, PaymentMethodInfo, UsageData } from "@/lib/queries/billing";
import BillingClient from "./BillingClient";

interface SubscriptionData {
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export default async function BillingPage() {
  const session = await requireSession();
  const token = session.backendToken;

  let currentPlan = "free";
  let hasStripeCustomer = false;

  try {
    const sub = await apiClient.get<SubscriptionData>("/api/billing/subscription", token);
    currentPlan = sub.plan ?? "free";
    hasStripeCustomer = !!sub.stripeCustomerId;
  } catch (err) {
    if (!(err instanceof ApiError)) {
      // unexpected non-HTTP error — default to free
    }
  }

  const [plansData, invoicesResult, usageResult, paymentMethodResult] = await Promise.all([
    fetchPlans().catch(() => null),
    apiClient
      .get<{ invoices: Invoice[] }>("/api/billing/invoices", token)
      .catch(() => null),
    apiClient
      .get<UsageData>("/api/billing/usage", token)
      .catch(() => null),
    apiClient
      .get<PaymentMethodInfo | null>("/api/billing/payment-method", token)
      .catch(() => null),
  ]);

  return (
    <BillingClient
      currentPlan={currentPlan}
      hasStripeCustomer={hasStripeCustomer}
      plans={plansData}
      invoices={invoicesResult?.invoices ?? []}
      usage={usageResult}
      paymentMethod={paymentMethodResult ?? null}
    />
  );
}
