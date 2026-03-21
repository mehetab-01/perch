import { z } from "zod"

export const spaceSchema = z.object({
  cafeId: z.string().uuid(),
  name: z.string().min(2, "Space name must be at least 2 characters").max(80),
  description: z.string().max(300).optional(),
  capacityMin: z.number().int().min(1, "Minimum 1 person"),
  capacityMax: z.number().int().min(1, "Maximum must be at least 1"),
  pricePerHour: z.number().min(1, "Price must be at least ₹1"),
  noiseLevel: z.enum(["quiet", "moderate", "lively"]),
  amenities: z.array(z.string()),
  photos: z.array(z.string().url()).max(5, "Maximum 5 photos"),
})

export type SpaceInput = z.infer<typeof spaceSchema>

export const spaceUpdateSchema = spaceSchema.partial().omit({ cafeId: true })

export type SpaceUpdateInput = z.infer<typeof spaceUpdateSchema>
