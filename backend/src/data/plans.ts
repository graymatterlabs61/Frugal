// ── Interfaces ───────────────────────────────────────────────────────────────

export interface PersonalPlan {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyTotal: number;
  yearlySaving: number;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  cancelText: string;
  /** Full feature list — used on /pricing page */
  features: string[];
  /** Short punchy list — used on landing page teaser (5 items max) */
  teaserFeatures: string[];
}

export interface CorporatePlan {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  tagline: string;
  price: string;
  priceSub: string;
  yearlyNote: string;
  seats: string;
  featured: boolean;
  ctaLabel: string;
  features: string[];
}

export interface Faq {
  q: string;
  a: string;
}

// ── Personal Plans ────────────────────────────────────────────────────────────
// ICP: individual developers, engineering managers, founders building AI products.
// Pain: surprise end-of-month bills, no unified view across providers, no guardrails.

export const personalPlans: PersonalPlan[] = [
  {
    id: "free",
    name: "Free",
    badge: "FREE",
    badgeClass: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    tagline: "See your AI spend before it sees you",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyTotal: 0,
    yearlySaving: 0,
    featured: false,
    ctaLabel: "Start free, upgrade when ready",
    ctaHref: "/signup",
    cancelText: "",
    features: [
      "1 API connection — OpenAI, Anthropic, Replicate, or fal.ai",
      "Unified spend dashboard — one place for all providers",
      "Email alerts when daily or monthly spend spikes",
      "7-day usage history",
      "5-minute polling · no proxy · no code change",
      "Connect in under 2 minutes",
    ],
    teaserFeatures: [
      "Unified dashboard — all providers in one view",
      "Email alerts on spend spikes",
      "7-day usage history",
      "1 connection · 1 project",
      "No proxy · no code change",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    badge: "POPULAR",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "Stop guessing. Start controlling.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    yearlyTotal: 180,
    yearlySaving: 48,
    featured: true,
    ctaLabel: "Start with Plus",
    ctaHref: "/signup?plan=plus",
    cancelText: "Cancel anytime. No lock-in.",
    features: [
      "3 API connections — cover your full AI stack",
      "5 projects — attribute cost by product or service",
      "Email + Slack alerts — catch overruns where your team works",
      "Budget guardrails: Alert before limits hit · Block at next poll",
      "Burn rate forecast — see your month-end total today",
      "90-day trend history — spot patterns, not just spikes",
      "Priority email support · 48h response",
    ],
    teaserFeatures: [
      "Monitor 3 providers — OpenAI, Anthropic, and one more",
      "Get Slack pings the moment a budget hits 80%",
      "Hard blocks that stop runaway spend automatically — not just notifications",
      "See where this month's costs are heading before you get the invoice",
      "90 days of history to spot recurring cost spikes",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "PRO",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    tagline: "Know exactly which users are costing you money.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    yearlyTotal: 468,
    yearlySaving: 120,
    featured: false,
    ctaLabel: "Start with Pro",
    ctaHref: "/signup?plan=pro",
    cancelText: "Cancel anytime. Switch to monthly anytime.",
    features: [
      "Per-user attribution — see exactly which end-users drive your AI costs",
      "Unlimited connections & projects",
      "1-year spend history — a full year of trend data",
      "Email + Slack + Webhook — pipe alerts into PagerDuty, Linear, or CI/CD",
      "Budget guardrails: Alert + Block on unlimited rules",
      "Programmatic API — automate budget enforcement in your deploy pipeline",
      "Priority email support · 24h response",
    ],
    teaserFeatures: [
      "See exactly which users drive your AI costs",
      "Monitor unlimited providers and projects",
      "Pipe alerts into PagerDuty, Linear, or CI/CD",
      "Automatically block overruns on unlimited rules",
      "Spot long-term trends with 1-year spend history",
    ],
  },
];

// ── Corporate Plans ───────────────────────────────────────────────────────────
// ICP: founders, CTOs, VPs Eng, finance leads at companies that fund AI access
// for employees or embed AI in products used by internal or external users.
// Pain: no visibility into who's spending what, runaway team AI bills,
// compliance gaps, no way to enforce per-person or per-project budgets.
// Status: Waitlist — launching Q3 2026. Proxy-based, real-time enforcement.

export const corporatePlans: CorporatePlan[] = [
  {
    id: "corp_starter",
    name: "Starter",
    badge: "TEAM",
    badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    tagline: "Get visibility before your team's AI bill surprises you",
    price: "$79",
    priceSub: "/month flat",
    yearlyNote: "~$63/mo billed annually",
    seats: "Up to 10 seats",
    featured: false,
    ctaLabel: "Get early access",
    features: [
      "One proxy config protects everyone",
      "Real-time employee & project tracking",
      "Sub-second throttling & blocks",
      "Budgets per-person, project, or org",
      "Secure metadata-only audit logs",
      "Email, Slack, & Webhook alerts",
      "10M events per month",
    ],
  },
  {
    id: "corp_growth",
    name: "Growth",
    badge: "GROWTH",
    badgeClass: "text-white bg-primary border-primary/60",
    tagline: "For companies where AI spend is a real line item",
    price: "$199",
    priceSub: "/month flat",
    yearlyNote: "~$159/mo billed annually",
    seats: "Up to 25 seats",
    featured: true,
    ctaLabel: "Get early access",
    features: [
      "Includes everything in Starter",
      "Protect up to 25 team members",
      "Per-team policies & alignment",
      "Cross-team spend dashboard",
      "Cost reports per feature or model",
      "25M events per month",
      "Priority email support",
    ],
  },
  {
    id: "corp_scale",
    name: "Scale",
    badge: "SCALE",
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    tagline: "Governance and compliance for serious AI deployments",
    price: "$499",
    priceSub: "/month flat",
    yearlyNote: "~$399/mo billed annually",
    seats: "Up to 100 seats",
    featured: false,
    ctaLabel: "Get early access",
    features: [
      "Includes everything in Growth",
      "Protect up to 100 team members",
      "SAML/SSO integration",
      "Export CSV/JSON audit logs",
      "99.9% uptime SLA",
      "Dedicated Slack channel support",
      "Unlimited events per month",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "CUSTOM",
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    tagline: "Custom contract, data residency, SLA with teeth",
    price: "Custom",
    priceSub: "contact us",
    yearlyNote: "Custom contract available",
    seats: "Unlimited seats",
    featured: false,
    ctaLabel: "Talk to sales",
    features: [
      "Includes everything in Scale",
      "Unlimited team members",
      "Custom data residency (EU, US)",
      "Custom pricing & volume discounts",
      "Dedicated onboarding support",
      "Custom SLA & breach penalties",
      "Expert architecture review",
    ],
  },
];

// ── FAQs ─────────────────────────────────────────────────────────────────────

export const faqs: Faq[] = [
  {
    q: "What's the difference between personal and corporate plans?",
    a: "Personal plans (Free · Plus · Pro) are for individual developers and engineering managers who track their own AI API spend. No proxy, no code change — Frugal polls your provider's usage API every 5 minutes. Corporate plans (Starter · Growth · Scale · Enterprise) add a proxy gateway that sits between your team's tooling and the AI provider, enabling real-time per-employee attribution and sub-second budget enforcement. Corporate is on the waitlist, targeting Q3 2026.",
  },
  {
    q: "How does the proxy gateway work on corporate plans?",
    a: "You replace the base URL in your team's AI tooling (e.g. OPENAI_BASE_URL) with Frugal's gateway once. Every request is attributed to the employee and project that made it, forwarded instantly to the provider, and checked against your budget policies in sub-second time. We log model, token count, cost, timestamp, and employee ID — never prompt content or completions.",
  },
  {
    q: "Does Frugal ever proxy my requests on a personal plan?",
    a: "No. On personal plans (Free · Plus · Pro), your requests go directly from your application to the AI provider. Frugal only reads your usage and billing data via each provider's reporting API. We never see your prompts, completions, or request content.",
  },
  {
    q: "Is my API key secure?",
    a: "Yes. Your key is AES-256-GCM encrypted immediately on receipt and stored only in encrypted form — never in plaintext anywhere in our stack. It is used exclusively to call your provider's usage/reporting endpoint, never to make model requests. The last 4 characters are shown in the UI; the full key is never returned after save. We are targeting SOC 2 Type II certification in Q4 2026.",
  },
  {
    q: "What does 5-minute polling mean in practice?",
    a: "Frugal fetches your latest spend from each connected provider every 5 minutes. Budget rules fire at the next poll cycle after a threshold is crossed. For most developers this is more than fast enough — use your provider's native hard limits as the immediate floor, and Frugal as the early-warning and automated response layer above that.",
  },
  {
    q: "What is the difference between Alert and Block on personal plans?",
    a: "Alert sends an email (and Slack on Plus+) when your spend crosses the threshold. Block flags the connection in Frugal and escalates alerts at the next poll cycle. Important: because Frugal never sits between your app and the provider on personal plans, it cannot stop requests mid-flight. Pair Block with your provider's native hard limit for a guaranteed stop. Throttle (real-time, sub-second) is only available on corporate plans where Frugal's proxy sits in the request path.",
  },
  {
    q: "What is the difference between Plus and Pro?",
    a: "Plus gives you 3 API connections, 5 projects, 90-day history, 1M SDK events/month, Slack alerts, budget guardrails (Alert + Block), and a burn rate forecast. Pro adds per-user attribution (see which end-users drive your AI costs), unlimited connections and projects, 1-year history, unlimited SDK events, webhook alerts, and programmatic API access. If you're monetizing a product built on AI — Pro's per-user attribution is the reason to upgrade.",
  },
  {
    q: "What is per-user attribution and who needs it?",
    a: "Per-user attribution links each AI API call back to the end-user who triggered it in your application. It lets you see which users are expensive, price contracts correctly, protect margins, and identify the 20% of users driving 80% of your AI costs. If you build a product where your users generate AI requests (rather than only you), Pro's attribution is essential for understanding your unit economics.",
  },
  {
    q: "Do I need to change any code to use Frugal on a personal plan?",
    a: "No. Connect your API key in the dashboard and Frugal starts polling immediately. Your application code, base URLs, model calls, and prompt logic are completely unchanged.",
  },
  {
    q: "Can I cancel or change plans at any time?",
    a: "Yes. Upgrade, downgrade, or cancel from the billing settings at any time. Cancellations take effect at the end of the current billing period — you keep access until then.",
  },
  {
    q: "When does the Corporate plan launch?",
    a: "Corporate is targeting Q3 2026. The waitlist is open — join to get early access and founding-customer pricing. We will not launch corporate until the personal plan is proven and our security posture (targeting SOC 2 Type II in Q4 2026) meets the bar enterprises expect.",
  },
  {
    q: "What AI providers does Frugal support?",
    a: "Currently: OpenAI, Anthropic, Replicate, and fal.ai. More providers are on the roadmap — if your provider exposes a usage or billing API, we can add it. Request support via founder@getfrugal.dev.",
  },
];
