"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { PersonalPlan } from "@/lib/queries/public";

export function PricingTeaser({ plans }: { plans: PersonalPlan[] }) {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
      <div className="mb-12 text-center">
        <p className="mb-3 font-ethnocentric text-[10px] tracking-widest text-primary">
          Pricing
        </p>
        <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Start free, upgrade when{" "}
          <span className="font-playfair italic tracking-normal font-normal">spend grows</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          No credit card to start. No proxy, no code change on any plan.
        </p>
      </div>

      {/* Interval toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly billing"
          onClick={() => setIsYearly(!isYearly)}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 border border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out ${
              isYearly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium flex items-center ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          Yearly
          <span className="ml-2 rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">
            2 months free
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.id}
              className={`glass-panel backdrop-blur-md card-lift flex flex-col rounded-3xl p-7 md:p-8 ${
                plan.featured ? "[&]:border-primary/40 relative" : ""
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {price === 0 ? "forever" : "/month"}
                </span>
              </div>
              {price > 0 && isYearly && (
                <p className="mt-1 text-xs text-muted-foreground">billed annually</p>
              )}

              <Link
                href={plan.ctaHref}
                className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_#FF500B40]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {plan.ctaLabel}
              </Link>

              <ul className="mt-7 flex flex-col gap-3">
                {plan.teaserFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need team-level proxy control with per-employee attribution?{" "}
        <Link
          href="/pricing?tab=corporate"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
        >
          See Corporate plans <ArrowRight size={13} />
        </Link>
      </p>
    </section>
  );
}
