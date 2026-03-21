import { z } from "zod"

const ratingField = z.number().int().min(1).max(5)

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  overallRating: ratingField,
  wifiRating: ratingField.optional(),
  noiseRating: ratingField.optional(),
  spaceRating: ratingField.optional(),
  staffRating: ratingField.optional(),
  comment: z.string().max(500).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

export const respondToReviewSchema = z.object({
  response: z.string().min(1).max(300),
})

export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>
