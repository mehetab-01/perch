import { z } from "zod"

export const cafeDetailsSchema = z.object({
  name: z.string().min(2, "Cafe name must be at least 2 characters").max(100),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  address: z.string().min(5, "Please enter a full address"),
  city: z.string().min(1, "Please select a city"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  coverPhotoUrl: z.string().url().optional(),
})

export type CafeDetailsInput = z.infer<typeof cafeDetailsSchema>

export const cafeDocumentsSchema = z.object({
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
    .optional()
    .or(z.literal("")),
  fssaiLicenseNumber: z
    .string()
    .regex(/^\d{14}$/, "FSSAI number must be 14 digits")
    .optional()
    .or(z.literal("")),
  fssaiLicenseUrl: z.string().url().optional().or(z.literal("")),
})

export type CafeDocumentsInput = z.infer<typeof cafeDocumentsSchema>

export const cafeSubmitSchema = z.object({
  cafeId: z.string().uuid(),
})

export type CafeSubmitInput = z.infer<typeof cafeSubmitSchema>

// Slug generator
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat("-", Math.random().toString(36).slice(2, 6))
}
