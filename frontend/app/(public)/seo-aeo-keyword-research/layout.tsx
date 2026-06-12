import type { Metadata } from "next";

const title = "Free AI & AEO Keyword Research Tool for Developers";
const description =
  "Find high-intent keywords for AI-powered products optimized for answer engines (AEO) and traditional SEO. Discover what developers search when looking for OpenAI cost tools, Anthropic APIs, and LLM infrastructure.";
const url = "https://getfrugal.dev/seo-aeo-keyword-research";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AEO keyword research tool",
    "answer engine optimization keywords",
    "AI product keyword research",
    "LLM SEO keyword tool",
    "free keyword research AI",
    "OpenAI API keywords",
    "Anthropic SEO keywords",
    "AI startup content keywords",
    "developer SEO tool",
    "AI search keyword finder",
    "Perplexity AI keyword research",
    "ChatGPT search keywords",
    "AI product marketing keywords",
    "LLM cost management keywords",
    "AI API developer keywords",
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    type: "website",
    url,
    siteName: "Frugal",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@neilkumaroff",
    images: ["/twitter.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI & AEO Keyword Research Tool",
  description,
  url,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: {
    "@type": "Organization",
    name: "Frugal",
    url: "https://getfrugal.dev",
  },
};

export default function KeywordResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
