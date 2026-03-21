import { eq, and, gte, desc, sql, or, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, cafes, spaces, reviews } from "@/lib/db/schema"
import type {
  BookingWithDetails,
  DashboardStats,
  QuickBookCafe,
  ActivityItem,
} from "@/types/dashboard"

const bookingWithDetailsSelect = {
  id: bookings.id,
  date: bookings.date,
  startTime: bookings.startTime,
  endTime: bookings.endTime,
  durationHours: bookings.durationHours,
  numAttendees: bookings.numAttendees,
  meetingTitle: bookings.meetingTitle,
  agenda: bookings.agenda,
  status: bookings.status,
  checkinToken: bookings.checkinToken,
  totalAmount: bookings.totalAmount,
  platformFee: bookings.platformFee,
  cafePayout: bookings.cafePayout,
  cancelledAt: bookings.cancelledAt,
  cancelReason: bookings.cancelReason,
  createdAt: bookings.createdAt,
  cafeName: cafes.name,
  cafeSlug: cafes.slug,
  cafeAddress: cafes.address,
  spaceName: spaces.name,
}

export async function getUpcomingBookings(
  userId: string,
  limit = 3
): Promise<BookingWithDetails[]> {
  const today = new Date().toISOString().split("T")[0]!

  const result = await db
    .select(bookingWithDetailsSelect)
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(
      and(
        eq(bookings.workerId, userId),
        gte(bookings.date, today),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "pending"),
          eq(bookings.status, "checked_in")
        )
      )
    )
    .orderBy(bookings.date, bookings.startTime)
    .limit(limit)

  return result
}

export async function getBookingsByStatus(
  userId: string,
  statuses: string[],
  limit = 20,
  offset = 0
): Promise<BookingWithDetails[]> {
  const result = await db
    .select(bookingWithDetailsSelect)
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(
      and(
        eq(bookings.workerId, userId),
        inArray(bookings.status, statuses as ("pending" | "confirmed" | "checked_in" | "completed" | "cancelled")[])
      )
    )
    .orderBy(desc(bookings.date), desc(bookings.startTime))
    .limit(limit)
    .offset(offset)

  return result
}

export async function getBookingById(
  userId: string,
  bookingId: string
): Promise<BookingWithDetails | null> {
  const result = await db
    .select(bookingWithDetailsSelect)
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(and(eq(bookings.id, bookingId), eq(bookings.workerId, userId)))
    .limit(1)

  return result[0] ?? null
}

/** Check whether a review already exists for a specific booking */
export async function hasReviewForBooking(bookingId: string): Promise<boolean> {
  const result = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1)

  return result.length > 0
}

/** Get completed bookings that have NOT been reviewed yet (for dashboard banner) */
export async function getReviewableBookings(
  userId: string,
  limit = 1
): Promise<BookingWithDetails[]> {
  const result = await db
    .select(bookingWithDetailsSelect)
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(
      and(
        eq(bookings.workerId, userId),
        eq(bookings.status, "completed")
      )
    )
    .orderBy(desc(bookings.date))
    .limit(limit * 3) // fetch more, then filter

  // Filter out bookings that already have a review
  const withReviewCheck = await Promise.all(
    result.map(async (b) => {
      const reviewed = await hasReviewForBooking(b.id)
      return reviewed ? null : b
    })
  )

  return withReviewCheck.filter((b): b is BookingWithDetails => b !== null).slice(0, limit)
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!

  const result = await db
    .select({
      count: sql<number>`count(*)`,
      totalSpent: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)`,
      totalHours: sql<number>`coalesce(sum(${bookings.durationHours}), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.workerId, userId),
        gte(bookings.date, firstOfMonth),
        inArray(bookings.status, ["confirmed", "checked_in", "completed"])
      )
    )

  const row = result[0]!
  return {
    meetingsThisMonth: Number(row.count),
    spentThisMonth: Number(row.totalSpent),
    hoursThisMonth: Number(row.totalHours),
  }
}

export async function getQuickBookCafes(
  userId: string,
  limit = 3
): Promise<QuickBookCafe[]> {
  // Get distinct cafes from recent bookings
  const result = await db
    .selectDistinctOn([cafes.id], {
      id: cafes.id,
      name: cafes.name,
      slug: cafes.slug,
      address: cafes.address,
      cheapestPrice: sql<number>`min(${spaces.pricePerHour})`,
    })
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(spaces.cafeId, cafes.id))
    .where(eq(bookings.workerId, userId))
    .groupBy(cafes.id, cafes.name, cafes.slug, cafes.address, bookings.date)
    .orderBy(cafes.id, desc(bookings.date))
    .limit(limit)

  return result.map((r) => ({
    ...r,
    cheapestPrice: Number(r.cheapestPrice),
  }))
}

export async function getRecentActivity(
  userId: string,
  limit = 5
): Promise<ActivityItem[]> {
  const recentBookings = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      cafeName: cafes.name,
      date: bookings.date,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
    })
    .from(bookings)
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .where(eq(bookings.workerId, userId))
    .orderBy(desc(bookings.updatedAt))
    .limit(limit)

  const recentReviews = await db
    .select({
      id: reviews.id,
      cafeName: cafes.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(cafes, eq(reviews.cafeId, cafes.id))
    .where(eq(reviews.workerId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(3)

  const items: ActivityItem[] = []

  for (const b of recentBookings) {
    const typeMap: Record<string, ActivityItem["type"]> = {
      completed: "booking_completed",
      cancelled: "booking_cancelled",
      confirmed: "booking_confirmed",
    }
    const type = typeMap[b.status]
    if (!type) continue

    const descMap: Record<string, string> = {
      completed: `Meeting at ${b.cafeName} completed`,
      cancelled: `Booking at ${b.cafeName} cancelled`,
      confirmed: `Booking at ${b.cafeName} confirmed for ${b.date}`,
    }

    items.push({
      id: b.id,
      type,
      description: descMap[b.status] ?? `Booking at ${b.cafeName}`,
      timestamp: b.updatedAt,
    })
  }

  for (const r of recentReviews) {
    items.push({
      id: r.id,
      type: "review_left",
      description: `Left a review for ${r.cafeName}`,
      timestamp: r.createdAt,
    })
  }

  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}
