import { Geist, Geist_Mono, Lora, Oxanium } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const oxaniumHeading = Oxanium({subsets:['latin'],variable:'--font-heading'});

const lora = Lora({subsets:['latin'],variable:'--font-serif'});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable, "font-serif", lora.variable, oxaniumHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
