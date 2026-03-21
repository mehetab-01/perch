import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const availabilitySlotSchema = z.object({
  spaceId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6), // 0=Sun … 6=Sat
  startTime: z.string().regex(timeRegex, "Time format must be HH:MM"),
  endTime: z.string().regex(timeRegex, "Time format must be HH:MM"),
  isRecurring: z.boolean().default(true),
})

export const availabilityBatchSchema = z.object({
  spaceId: z.string().uuid(),
  slots: z.array(
    z.object({
      dayOfWeek: z.coerce.number().int().min(0).max(6),
      startTime: z.string().regex(timeRegex, "Time format must be HH:MM"),
      endTime: z.string().regex(timeRegex, "Time format must be HH:MM"),
    })
  ).min(1, "At least one availability slot is required"),
})

export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>
export type AvailabilityBatchInput = z.infer<typeof availabilityBatchSchema>
