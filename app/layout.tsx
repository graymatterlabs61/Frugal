import type { Metadata } from "next"
import { Geist, Geist_Mono, Oxanium } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"

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
    "OpenAI budget",
    "Anthropic cost tracking",
    "AI spend monitoring",
    "API budget alerts",
    "AI cost control",
    "Replicate cost",
    "fal.ai monitoring",
    "AI billing alerts",
    "developer tools",
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
        url: `${siteUrl}/og.png`,
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
    images: [`${siteUrl}/og.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  category: "technology",
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
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}