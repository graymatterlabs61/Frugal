import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: "gray-matter-labs",
  project: "javascript-nextjs",

  // Silence CLI output unless in CI
  silent: !process.env.CI,

  // Upload source maps for readable prod stack traces
  widenClientFileUpload: true,

  // Route Sentry requests through /monitoring to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Keep source maps off the client bundle
  sourcemaps: { deleteSourcemapsAfterUpload: true },

  // Tree-shake Sentry logger statements in prod
  disableLogger: true,

  // Auto-instrument Vercel Cron Monitors
  automaticVercelMonitors: true,
})
