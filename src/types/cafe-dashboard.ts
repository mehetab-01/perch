// ─── Cafe Dashboard Types ────────────────────────────────────────────────────

export type CafeBookingWithDetails = {
  id: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  numAttendees: number
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"
  checkinToken: string | null
  totalAmount: number // paise
  platformFee: number // paise
  cafePayout: number // paise
  cancelledAt: Date | null
  createdAt: Date
  workerName: string
  spaceName: string
}

export type CafeDashboardStats = {
  earnedThisMonth: number // paise
  bookingsThisMonth: number
  avgRating: number
}

export type CafeEarningsStats = {
  totalEarned: number // paise
  earnedThisMonth: number // paise
  pendingPayout: number // paise
}

export type CafeEarningsDay = {
  date: string
  amount: number // paise
}

export type CafeTransaction = {
  id: string
  date: string
  spaceName: string
  cafePayout: number // paise
  paymentStatus: "pending" | "captured" | "failed" | "refunded"
  payoutStatus: "pending" | "settled" | "failed"
}

export type CafeReviewWithDetails = {
  id: string
  overallRating: number
  wifiRating: number | null
  noiseRating: number | null
  spaceRating: number | null
  staffRating: number | null
  comment: string | null
  cafeResponse: string | null
  workerName: string
  createdAt: Date
}

export type CafeReviewStats = {
  avgOverall: number
  avgWifi: number
  avgNoise: number
  avgSpace: number
  avgStaff: number
  totalReviews: number
}
