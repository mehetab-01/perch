export type UserRole = "worker" | "cafe_owner" | "admin"

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"

export type NoiseLevel = "quiet" | "moderate" | "lively"

export type VerificationStatus = "pending" | "verified" | "rejected"

export type PaymentStatus = "pending" | "captured" | "failed" | "refunded"

export interface CafeSpace {
  id: string
  cafeId: string
  name: string
  description: string
  capacityMin: number
  capacityMax: number
  pricePerHour: number
  amenities: string[]
  noiseLevel: NoiseLevel
  photos: string[]
  isActive: boolean
}

export interface BookingDetails {
  id: string
  workerId: string
  spaceId: string
  cafeId: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  numAttendees: number
  meetingTitle?: string
  agenda?: string
  status: BookingStatus
  totalAmount: number
  platformFee: number
  cafePayout: number
}
