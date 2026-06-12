import type { MetadataRoute } from "next"

const BASE_URL = "https://getfrugal.dev"
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: NOW,
    },
    {
      url: `${BASE_URL}/pricing`,
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
}
