import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/blog/posts"

const BASE_URL = "https://getfrugal.dev"
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/features/openai`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: NOW,
    },
  ]

  const blogPages: MetadataRoute.Sitemap = Object.entries(BLOG_POSTS).map(
    ([slug, { meta }]) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date(meta.date),
    })
  )

  return [...staticPages, ...blogPages]
}
