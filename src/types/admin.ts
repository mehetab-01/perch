export type AdminStats = {
  totalUsers: number
  totalCafes: number
  cafesVerified: number
  cafesPending: number
  cafesRejected: number
  bookingsThisMonth: number
  gmvThisMonth: number // paise
  revenueThisMonth: number // paise (platform fees)
}

export type AdminActivityItem = {
  id: string
  type: "user_signup" | "cafe_created" | "booking_made" | "review_left"
  description: string
  timestamp: Date
}

export type AdminCafe = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  gstNumber: string | null
  fssaiLicenseUrl: string | null
  verificationStatus: "pending" | "verified" | "rejected"
  isActive: boolean
  createdAt: Date
  ownerName: string
  ownerEmail: string
  ownerId: string
  spaceCount: number
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: "worker" | "cafe_owner" | "admin"
  avatarUrl: string | null
  createdAt: Date
  bookingCount: number
  cafeCount: number
}

export type AdminBooking = {
  id: string
  workerName: string
  cafeName: string
  spaceName: string
  date: string
  startTime: string
  endTime: string
  totalAmount: number // paise
  platformFee: number // paise
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"
  createdAt: Date
}
