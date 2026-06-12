import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "The Journal — AI API Engineering & Cost Management | Frugal",
    template: "%s | Frugal Journal",
  },
  description:
    "Long-form engineering notes on AI API cost management, LLM optimization, Supabase RLS, serverless architecture, and running AI features on a startup budget.",
  keywords: [
    "AI API cost management blog",
    "LLM cost optimization guide",
    "OpenAI API spending tips",
    "Anthropic Claude cost reduction",
    "AI startup engineering blog",
    "serverless AI architecture",
    "prompt caching tutorial",
    "Supabase RLS multi-tenant",
    "QStash polling worker",
    "AI API budget alerts",
    "reduce OpenAI bill",
    "LLM token optimization",
    "AI engineering blog",
    "developer AI cost control",
  ],
  alternates: { canonical: "https://getfrugal.dev/blog" },
  openGraph: {
    type: "website",
    url: "https://getfrugal.dev/blog",
    siteName: "Frugal",
    title: "The Journal — AI API Engineering & Cost Management",
    description:
      "Long-form engineering notes on AI API cost management, LLM optimization, and running AI features on a startup budget.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Journal — AI API Engineering & Cost Management | Frugal",
    description:
      "Long-form engineering notes on AI API cost management, LLM optimization, and running AI features on a startup budget.",
    creator: "@neilkumaroff",
    images: ["/twitter.png"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
