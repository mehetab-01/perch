export type BookingWithDetails = {
  id: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  numAttendees: number
  meetingTitle: string | null
  agenda: string | null
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"
  checkinToken: string | null
  totalAmount: number // paise
  platformFee: number
  cafePayout: number
  isRecurring: boolean
  recurringGroupId: string | null
  recurrencePattern: string | null
  cancelledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  cafeName: string
  cafeSlug: string
  cafeAddress: string
  spaceName: string
}

export type DashboardStats = {
  meetingsThisMonth: number
  spentThisMonth: number // paise
  hoursThisMonth: number
}

export type QuickBookCafe = {
  id: string
  name: string
  slug: string
  address: string
  cheapestPrice: number // paise
}

export type ActivityItem = {
  id: string
  type: "booking_completed" | "review_left" | "booking_cancelled" | "booking_confirmed"
  description: string
  timestamp: Date
}
