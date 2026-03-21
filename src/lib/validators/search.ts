import { z } from "zod"

export const searchParamsSchema = z.object({
  city: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  duration: z.coerce.number().min(0.5).max(12).optional(),
  people: z.coerce.number().int().min(1).max(20).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  amenities: z.string().optional(), // comma-separated
  noiseLevel: z.enum(["quiet", "moderate", "lively"]).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "rating", "distance"])
    .optional()
    .default("rating"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

export type SearchParams = z.infer<typeof searchParamsSchema>

export function parseAmenities(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
}
