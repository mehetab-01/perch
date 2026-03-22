import { z } from "zod"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export const createBookingSchema = z.object({
  spaceId: z.string().regex(uuidPattern, "Invalid space ID"),
  cafeId: z.string().regex(uuidPattern, "Invalid cafe ID"),
  date: z.string().regex(datePattern, "Date must be YYYY-MM-DD format"),
  startTime: z.string().regex(timePattern, "Start time must be HH:mm format"),
  endTime: z.string().regex(timePattern, "End time must be HH:mm format"),
  durationHours: z.number().min(0.5).max(8),
  numAttendees: z.number().int().min(1).max(20),
  meetingTitle: z.string().max(200).optional(),
  agenda: z.string().max(1000).optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["weekly", "biweekly"]).optional(),
  recurrenceEndDate: z.string().regex(datePattern, "End date must be YYYY-MM-DD format").optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
