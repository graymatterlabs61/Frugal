import type { Metadata } from "next"
import { Geist, Geist_Mono, Oxanium } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import { Toaster } from "sonner"
import { CookieConsent } from "@/components/ui/cookie-consent"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-heading" })
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const siteUrl = "https://getfrugal.dev"
const siteTitle = "AI API Cost Management: Track Spend & Stop Bill Shock"
const siteDescription =
  "Transform your AI API cost management by tracking OpenAI and Anthropic spend in real time. Set limits, prevent massive overages, and start free today."

const ogTitle = "Stop OpenAI Bill Shock | Frugal AI API Cost Management"
const ogDescription =
  "Centralize your LLM spend monitoring with Frugal. Set strict budgets for OpenAI, Anthropic, and Replicate, and get instant Slack alerts before you're charged."

const twitterTitle = "Stop OpenAI Bill Shock with Frugal"
const twitterDescription =
  "Don't wait for your monthly invoice to discover you've overspent. Frugal provides real-time API cost tracking, budget alerts, and complete peace of mind for developers building with AI."

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
    title: ogTitle,
    description: ogDescription,
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
    title: twitterTitle,
    description: twitterDescription,
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
        email: "support@getfrugal.dev",
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
      data-scroll-behavior="smooth"
      className={cn(
        "dark antialiased",
        fontSans.variable,
        fontMono.variable,
        oxanium.variable
      )}
    >
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-18G4BDB421" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });

            gtag('js', new Date());
            gtag('config', 'G-18G4BDB421');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <CookieConsent />
        <Toaster theme="dark" position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
