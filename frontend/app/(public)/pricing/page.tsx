import type { Metadata } from "next";
import { fetchPlans } from "@/lib/queries/public";
import { PricingPageClient } from "./PricingPageClient";

const title = "Pricing — Free AI API Cost Monitoring, Paid Plans from $15/mo";
const description =
  "Simple, transparent pricing for AI API cost monitoring. Free plan monitors 1 provider forever — no credit card, no code change. Plus and Pro plans for teams.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getfrugal.dev/pricing" },
  openGraph: {
    title,
    description,
    url: "https://getfrugal.dev/pricing",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter.png"],
  },
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
