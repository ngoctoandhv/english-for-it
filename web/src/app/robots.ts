import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/glossary", "/privacy", "/terms"], disallow: ["/admin", "/learn", "/settings", "/placement", "/onboarding", "/progress"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
