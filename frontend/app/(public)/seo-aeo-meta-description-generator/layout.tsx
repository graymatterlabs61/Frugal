import type { Metadata } from "next";

const title = "Free AEO Meta Description Generator for AI Products";
const description =
  "Generate SEO and answer-engine-optimized meta descriptions for pages targeting Perplexity, ChatGPT Search, and Google AI Overviews. Tailored for developer tools, AI APIs, and SaaS landing pages.";
const url = "https://getfrugal.dev/seo-aeo-meta-description-generator";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AEO meta description generator",
    "answer engine optimized meta description",
    "free meta description generator AI",
    "AI search meta description tool",
    "Perplexity SEO meta description",
    "ChatGPT search optimization",
    "Google SGE meta description",
    "meta description for AI products",
    "developer tool meta description",
    "SaaS landing page SEO",
    "LLM product meta description",
    "AI startup SEO tool",
    "meta description best practices 2026",
    "answer engine optimization tool",
    "free SEO tool for developers",
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
  name: "AEO Meta Description Generator",
  description,
  url,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Traditional SEO meta description",
    "Answer Engine Optimization (AEO) variant",
    "Conversational AI search variant",
    "Character count validation",
    "One-click copy",
  ],
  publisher: {
    "@type": "Organization",
    name: "Frugal",
    url: "https://getfrugal.dev",
  },
};

export default function MetaDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
