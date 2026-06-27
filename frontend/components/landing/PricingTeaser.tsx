"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { PersonalPlan } from "@/lib/queries/public";

export function PricingTeaser({ plans }: { plans: PersonalPlan[] }) {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-24 md:py-32">
      <div className="mb-12 text-center">
        <p className="section-eyebrow mx-auto mb-3">Pricing</p>
        <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Start free, upgrade when{" "}
          <span className="italic tracking-normal font-normal text-primary">spend grows</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground leading-relaxed">
          No credit card to start. No proxy, no code change on any plan.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
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
              <h3 className="text-base font-semibold text-foreground leading-snug">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-foreground font-mono stat-display">
                  ${plan.yearlyPrice}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.yearlyPrice === 0 ? "forever" : "/month"}
                </span>
              </div>
              {plan.monthlyPrice > 0 && (
                <div className="mt-1 flex flex-col">
                  <span className="text-sm text-muted-foreground/70">
                    ${plan.monthlyPrice} /month (billed monthly)
                  </span>
                  <span className="mt-1 text-xs font-medium text-emerald-500">
                    billed annually · save 2 months
                  </span>
                </div>
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
              
              {plan.cancelText && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  {plan.cancelText}
                </p>
              )}

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

      <p className="mt-8 text-center text-xs text-muted-foreground">
        No credit card required · Cancel anytime · Data export on cancellation
      </p>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Managing AI spend across a whole team?{" "}
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
