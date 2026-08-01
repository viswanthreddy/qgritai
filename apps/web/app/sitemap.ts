import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const publicRoutes = [
  { path: "", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/solutions", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/industries", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/work", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/tools", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/insights", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/accessibility", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/security", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/readiness", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/roi", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
