import { fetchPlans } from "@/lib/queries/public";
import { PricingPageClient } from "./PricingPageClient";

export const metadata = {
  title: "Pricing — Frugal",
  description:
    "Simple, transparent pricing for AI API cost monitoring. Start free — no credit card, no code change.",
};

export default async function PricingPage() {
  const plans = await fetchPlans();
  return (
    <PricingPageClient
      personalPlans={plans.personal}
      corporatePlans={plans.corporate}
      faqs={plans.faqs}
    />
  );
}
