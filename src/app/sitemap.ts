import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL || "https://cinemax77.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/download`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  return routes;
}
