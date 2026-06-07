import type { Metadata } from "next"
import { Geist, Geist_Mono, Oxanium } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import { Toaster } from "sonner"

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-heading" })
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const siteUrl = "https://frugal.so"
const siteTitle = "Frugal — AI API Cost Management"
const siteDescription =
  "Monitor your OpenAI, Anthropic, Replicate, and fal.ai spend in real time. Set budget limits, get alerts before limits hit, and stop surprise invoices."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Frugal",
  },
  description: siteDescription,
  keywords: [
    "AI API cost management",
    "OpenAI cost monitoring tool",
    "how to monitor openai api costs",
    "set budget limit anthropic api",
    "track replicate ai spend",
    "prevent openai overspend",
    "llm api cost calculator",
    "llm spend management software",
    "OpenAI budget limits",
    "Anthropic cost tracking",
    "API budget alerts",
    "AI cost control",
    "AI billing alerts",
    "developer tools for AI",
    "AI API usage tracking",
    "AI infrastructure costs",
    "LLM cost monitoring",
    "AI spend dashboard",
  ],
  authors: [{ name: "Nilesh Kumar", url: "https://x.com/neilkumaroff" }],
  creator: "Nilesh Kumar",
  publisher: "Gray Matter Labs, Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Frugal",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `/og.png`,
        width: 1200,
        height: 630,
        alt: "Frugal — AI API Cost Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@neilkumaroff",
    images: [`/twitter.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "technology",
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Frugal",
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`,
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@frugal.so",
        contactType: "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Frugal",
      description: siteDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "Frugal",
      description: siteDescription,
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available. Paid plans for Pro and Enterprise.",
      },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark antialiased",
        fontSans.variable,
        fontMono.variable,
        oxanium.variable
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
