export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
}

export interface CoverStory {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  authorName: string;
  authorInitials: string;
}

export const coverStory: CoverStory = {
  slug: "controlling-employee-ai-spend-and-governance",
  title: "The Founder's Guide to Controlling Employee AI Spend",
  description:
    "Managing team AI access requires centralized API key management, real-time spend tracking, and automated budget alerts. Empower your team without risking surprise bills.",
  date: "2024-10-24",
  category: "Cover Story",
  image: "/images/blog/cover_story.png",
  authorName: "Nilesh Kumar",
  authorInitials: "NK",
};

export const blogPosts: BlogPost[] = [
  {
    slug: "anthropic-prompt-caching-cut-bill-by-40",
    title: "Anthropic Prompt Caching: How to Cut Your Claude 3.5 Bill by 40%",
    description:
      "A technical teardown of Anthropic's caching mechanics and how to leverage it to significantly cut your input token costs.",
    date: "Jun 12, 2026",
    category: "Cost Optimization",
    image: "/images/blog/prompt_caching.png",
  },
  {
    slug: "openai-vs-anthropic-real-world-cost-analysis",
    title: "OpenAI vs Anthropic: A Real-World Cost Analysis of GPT-4o vs Claude 3.5 Sonnet",
    description:
      "Comparing the pricing models, token efficiency, and hidden costs of the two major foundation models for enterprise workloads.",
    date: "Jun 12, 2026",
    category: "Market Analysis",
    image: "/images/blog/openai_anthropic.png",
  },
  {
    slug: "hidden-cost-of-llm-retries-exponential-backoff",
    title: "The Hidden Cost of LLM Retries: How Exponential Backoff Can Triple Your API Bill",
    description:
      "A debugging story about how poorly configured retry logic on 429s causes massive unexpected spending spikes during provider outages.",
    date: "Jun 12, 2026",
    category: "Engineering",
    image: "/images/blog/llm_retries.png",
  },
  {
    slug: "building-idempotent-polling-worker-qstash",
    title: "Building an Idempotent Polling Worker with QStash for AI Usage Tracking",
    description:
      "Why Vercel functions fail for long-running cron jobs, and how we solved 5-minute polling using Upstash QStash.",
    date: "Jun 12, 2026",
    category: "Architecture",
    image: "/images/blog/polling_worker.png",
  },
  {
    slug: "rate-limits-vs-budgets-managing-chaos",
    title: "Rate Limits vs. Budgets: Managing the Chaos of Multi-Provider AI Deployments",
    description:
      "Why relying on provider-level rate limits isn't enough to prevent cost overruns, and why hard budget caps are necessary.",
    date: "Jun 12, 2026",
    category: "Governance",
    image: "/images/blog/rate_limits.png",
  },
  {
    slug: "developer-byok-security-nightmare",
    title: "Why Developer 'Bring Your Own Key' (BYOK) Models Are a Security Nightmare",
    description:
      "The dangers of asking employees to paste their personal OpenAI keys into internal tools and why it breaks compliance.",
    date: "Jun 12, 2026",
    category: "Security",
    image: "/images/blog/byok_security.png",
  },
  {
    slug: "hard-caps-ai-spend-warning-vs-blocking",
    title: "Setting Up Hard Caps on AI Spend: The Difference Between Warning and Blocking",
    description:
      "How to implement circuit breakers in your AI architecture to block requests before you go bankrupt on nights and weekends.",
    date: "Jun 12, 2026",
    category: "SaaS Operations",
    image: "/images/blog/hard_caps.png",
  },
  {
    slug: "aes-256-encryption-api-keys-server-side",
    title: "AES-256 Encryption for API Keys: Why We Don't Trust Client-Side Storage",
    description:
      "An engineering explanation of how Frugal securely handles user API keys using server-side AES-256 encryption.",
    date: "Jun 12, 2026",
    category: "Cryptography",
    image: "/images/blog/aes_encryption.png",
  },
  {
    slug: "analyzed-10m-api-tokens-wasting-money",
    title: "We Analyzed 10M API Tokens: Here's Where Your Engineering Team is Wasting Money",
    description:
      "Data-driven insights into common anti-patterns like unnecessarily long system prompts and lacking max_tokens limits.",
    date: "Jun 12, 2026",
    category: "Data Science",
    image: "/images/blog/data_tokens.png",
  },
  {
    slug: "replicate-vs-fal-ai-economics-image-generation",
    title: "Replicate vs. fal.ai: The Economics of Serverless Image Generation",
    description:
      "Breaking down cold boots, per-second pricing vs per-image pricing, and when to switch providers.",
    date: "Jun 12, 2026",
    category: "Generative AI",
    image: "/images/blog/image_gen.png",
  },
  {
    slug: "nextjs-app-router-vs-pages-router-b2b-dashboard",
    title: "Why We Chose Next.js App Router over Pages Router for a B2B Dashboard",
    description:
      "An engineering perspective on migrating to React Server Components and nested layouts for heavy B2B applications.",
    date: "Jun 12, 2026",
    category: "Frontend",
    image: "/images/blog/nextjs_dashboard.png",
  },
  {
    slug: "structuring-supabase-rls-policies-multi-tenant-saas",
    title: "Structuring Supabase RLS Policies for Multi-Tenant SaaS",
    description:
      "How to use Row Level Security in Postgres to ensure zero data leakage between enterprise clients.",
    date: "Jun 12, 2026",
    category: "Databases",
    image: "/images/blog/supabase_rls.png",
  },
  {
    slug: "handling-webhook-timeouts-stripe-events-background-queue",
    title: "Handling Webhook Timeouts: Moving Stripe Events to a Background Queue",
    description:
      "Why synchronous webhook processing causes 504 errors and how to solve it with event-driven architecture.",
    date: "Jun 12, 2026",
    category: "Systems Design",
    image: "/images/blog/webhook_queue.png",
  },
  {
    slug: "build-real-time-spend-chart-tailwind-recharts",
    title: "How to Build a Real-Time Spend Chart with Tailwind CSS and Recharts",
    description:
      "A front-end guide to visualizing thousands of API requests smoothly without crashing the browser.",
    date: "Jun 12, 2026",
    category: "UI/UX",
    image: "/images/blog/spend_chart.png",
  },
  {
    slug: "designing-developer-first-api-key-management-ui",
    title: "Designing a Developer-First API Key Management UI",
    description:
      "UX principles for handling sensitive credentials without frustrating your engineering users.",
    date: "Jun 12, 2026",
    category: "Product Management",
    image: "/images/blog/api_keys_ui.png",
  },
];
