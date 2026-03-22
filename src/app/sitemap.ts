export const dynamic = "force-dynamic"

import type { MetadataRoute } from "next"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes } from "@/lib/db/schema"

async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let verifiedCafes: { slug: string; updatedAt: Date }[] = []

  try {
    verifiedCafes = await db
      .select({ slug: cafes.slug, updatedAt: cafes.updatedAt })
      .from(cafes)
      .where(eq(cafes.verificationStatus, "verified"))
  } catch {
    // DB unavailable during build — return static pages only
  }

  const cafePages: MetadataRoute.Sitemap = verifiedCafes.map((cafe) => ({
    url: `https://getperch.in/cafe/${cafe.slug}`,
    lastModified: cafe.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: "https://getperch.in",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://getperch.in/search",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://getperch.in/for-cafes",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...cafePages,
  ]
}

export { sitemap as default }
