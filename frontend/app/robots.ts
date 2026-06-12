import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/dashboard",
          "/api/",
        ],
      },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"],
        allow: "/",
      },
      {
        userAgent: ["CCBot", "anthropic-ai", "Bytespider", "cohere-ai"],
        disallow: "/",
      },
    ],
    sitemap: "https://getfrugal.dev/sitemap.xml",
  }
}
