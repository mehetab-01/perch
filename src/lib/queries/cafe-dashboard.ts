import {
  eq,
  and,
  gte,
  lte,
  desc,
  sql,
  or,
  inArray,
  asc,
} from "drizzle-orm"
import { db } from "@/lib/db"
import {
  bookings,
  cafes,
  spaces,
  reviews,
  payments,
  users,
} from "@/lib/db/schema"
import type { Cafe, Space } from "@/lib/db/schema"
import type {
  CafeBookingWithDetails,
  CafeDashboardStats,
  CafeEarningsStats,
  CafeEarningsDay,
  CafeTransaction,
  CafeReviewWithDetails,
  CafeReviewStats,
} from "@/types/cafe-dashboard"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!
}

function firstOfMonthISO(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!
}

// ─── Cafe Lookup ─────────────────────────────────────────────────────────────

/** Get the first cafe owned by this user (most users own one cafe) */
export async function getOwnedCafe(ownerId: string): Promise<Cafe | null> {
  const result = await db
    .select()
    .from(cafes)
    .where(eq(cafes.ownerId, ownerId))
    .limit(1)

  return result[0] ?? null
}

/** Get cafe with its spaces */
export async function getOwnedCafeWithSpaces(
  ownerId: string
): Promise<{ cafe: Cafe; spaces: Space[] } | null> {
  const cafe = await getOwnedCafe(ownerId)
  if (!cafe) return null

  const cafeSpaces = await db
    .select()
    .from(spaces)
    .where(eq(spaces.cafeId, cafe.id))
    .orderBy(asc(spaces.createdAt))

  return { cafe, spaces: cafeSpaces }
}

// ─── Overview Queries ────────────────────────────────────────────────────────

const cafeBookingSelect = {
  id: bookings.id,
  date: bookings.date,
  startTime: bookings.startTime,
  endTime: bookings.endTime,
  durationHours: bookings.durationHours,
  numAttendees: bookings.numAttendees,
  status: bookings.status,
  checkinToken: bookings.checkinToken,
  totalAmount: bookings.totalAmount,
  platformFee: bookings.platformFee,
  cafePayout: bookings.cafePayout,
  cancelledAt: bookings.cancelledAt,
  createdAt: bookings.createdAt,
  workerName: users.name,
  spaceName: spaces.name,
}

export async function getTodaysBookings(
  cafeId: string
): Promise<CafeBookingWithDetails[]> {
  const today = todayISO()

  return db
    .select(cafeBookingSelect)
    .from(bookings)
    .innerJoin(users, eq(bookings.workerId, users.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(
      and(
        eq(bookings.cafeId, cafeId),
        eq(bookings.date, today),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "checked_in"),
          eq(bookings.status, "pending")
        )
      )
    )
    .orderBy(asc(bookings.startTime))
}

export async function getCafeDashboardStats(
  cafeId: string
): Promise<CafeDashboardStats> {
  const firstOfMonth = firstOfMonthISO()

  const result = await db
    .select({
      earned: sql<number>`coalesce(sum(${bookings.cafePayout}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.cafeId, cafeId),
        gte(bookings.date, firstOfMonth),
        inArray(bookings.status, ["confirmed", "checked_in", "completed"])
      )
    )

  const cafe = await db
    .select({ avgRating: cafes.avgRating })
    .from(cafes)
    .where(eq(cafes.id, cafeId))
    .limit(1)

  const row = result[0]!
  return {
    earnedThisMonth: Number(row.earned),
    bookingsThisMonth: Number(row.count),
    avgRating: cafe[0]?.avgRating ?? 0,
  }
}

/** Booking counts per day for the next 7 days */
export async function getWeekBookingCounts(
  cafeId: string
): Promise<{ date: string; count: number }[]> {
  const today = todayISO()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 6)
  const endStr = endDate.toISOString().split("T")[0]!

  const result = await db
    .select({
      date: bookings.date,
      count: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.cafeId, cafeId),
        gte(bookings.date, today),
        lte(bookings.date, endStr),
        inArray(bookings.status, [
          "pending",
          "confirmed",
          "checked_in",
          "completed",
        ])
      )
    )
    .groupBy(bookings.date)
    .orderBy(asc(bookings.date))

  // Fill in missing days
  const counts = new Map(result.map((r) => [r.date, Number(r.count)]))
  const days: { date: string; count: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split("T")[0]!
    days.push({ date: iso, count: counts.get(iso) ?? 0 })
  }
  return days
}

export async function getRecentCafeReviews(
  cafeId: string,
  limit = 3
): Promise<CafeReviewWithDetails[]> {
  return db
    .select({
      id: reviews.id,
      overallRating: reviews.overallRating,
      wifiRating: reviews.wifiRating,
      noiseRating: reviews.noiseRating,
      spaceRating: reviews.spaceRating,
      staffRating: reviews.staffRating,
      comment: reviews.comment,
      cafeResponse: reviews.cafeResponse,
      workerName: users.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.workerId, users.id))
    .where(and(eq(reviews.cafeId, cafeId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
}

// ─── Bookings Queries ────────────────────────────────────────────────────────

export async function getCafeBookingsByFilter(
  cafeId: string,
  filter: "today" | "upcoming" | "completed" | "cancelled",
  limit = 20,
  offset = 0
): Promise<CafeBookingWithDetails[]> {
  const today = todayISO()

  const conditions = [eq(bookings.cafeId, cafeId)]

  switch (filter) {
    case "today":
      conditions.push(eq(bookings.date, today))
      conditions.push(
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "checked_in"),
          eq(bookings.status, "pending")
        )!
      )
      break
    case "upcoming":
      conditions.push(gte(bookings.date, today))
      conditions.push(
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "pending")
        )!
      )
      break
    case "completed":
      conditions.push(eq(bookings.status, "completed"))
      break
    case "cancelled":
      conditions.push(eq(bookings.status, "cancelled"))
      break
  }

  return db
    .select(cafeBookingSelect)
    .from(bookings)
    .innerJoin(users, eq(bookings.workerId, users.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(and(...conditions))
    .orderBy(
      filter === "today" ? asc(bookings.startTime) : desc(bookings.date),
      desc(bookings.startTime)
    )
    .limit(limit)
    .offset(offset)
}

// ─── Earnings Queries ────────────────────────────────────────────────────────

export async function getCafeEarningsStats(
  cafeId: string
): Promise<CafeEarningsStats> {
  const firstOfMonth = firstOfMonthISO()

  const [allTime, monthly, pending] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${bookings.cafePayout}), 0)`,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.cafeId, cafeId),
          inArray(bookings.status, ["checked_in", "completed"])
        )
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${bookings.cafePayout}), 0)`,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.cafeId, cafeId),
          gte(bookings.date, firstOfMonth),
          inArray(bookings.status, ["checked_in", "completed"])
        )
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${payments.cafeAmount}), 0)`,
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .where(
        and(
          eq(bookings.cafeId, cafeId),
          eq(payments.paymentStatus, "captured"),
          eq(payments.payoutStatus, "pending")
        )
      ),
  ])

  return {
    totalEarned: Number(allTime[0]!.total),
    earnedThisMonth: Number(monthly[0]!.total),
    pendingPayout: Number(pending[0]!.total),
  }
}

export async function getDailyEarnings(
  cafeId: string
): Promise<CafeEarningsDay[]> {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!

  const result = await db
    .select({
      date: bookings.date,
      amount: sql<number>`coalesce(sum(${bookings.cafePayout}), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.cafeId, cafeId),
        gte(bookings.date, firstOfMonth),
        lte(bookings.date, lastOfMonth),
        inArray(bookings.status, ["checked_in", "completed"])
      )
    )
    .groupBy(bookings.date)
    .orderBy(asc(bookings.date))

  // Fill all days of the month
  const earningsMap = new Map(
    result.map((r) => [r.date, Number(r.amount)])
  )
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const days: CafeEarningsDay[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), i)
    const iso = d.toISOString().split("T")[0]!
    days.push({ date: iso, amount: earningsMap.get(iso) ?? 0 })
  }
  return days
}

export async function getCafeTransactions(
  cafeId: string,
  limit = 20,
  offset = 0
): Promise<CafeTransaction[]> {
  return db
    .select({
      id: bookings.id,
      date: bookings.date,
      spaceName: spaces.name,
      cafePayout: bookings.cafePayout,
      paymentStatus: payments.paymentStatus,
      payoutStatus: payments.payoutStatus,
    })
    .from(bookings)
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .innerJoin(payments, eq(payments.bookingId, bookings.id))
    .where(
      and(
        eq(bookings.cafeId, cafeId),
        inArray(bookings.status, ["checked_in", "completed"])
      )
    )
    .orderBy(desc(bookings.date))
    .limit(limit)
    .offset(offset)
}

// ─── Reviews Queries ─────────────────────────────────────────────────────────

export async function getCafeReviews(
  cafeId: string,
  limit = 20,
  offset = 0
): Promise<CafeReviewWithDetails[]> {
  return db
    .select({
      id: reviews.id,
      overallRating: reviews.overallRating,
      wifiRating: reviews.wifiRating,
      noiseRating: reviews.noiseRating,
      spaceRating: reviews.spaceRating,
      staffRating: reviews.staffRating,
      comment: reviews.comment,
      cafeResponse: reviews.cafeResponse,
      workerName: users.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.workerId, users.id))
    .where(and(eq(reviews.cafeId, cafeId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getCafeReviewStats(
  cafeId: string
): Promise<CafeReviewStats> {
  const result = await db
    .select({
      avgOverall: sql<number>`coalesce(avg(${reviews.overallRating}), 0)`,
      avgWifi: sql<number>`coalesce(avg(${reviews.wifiRating}), 0)`,
      avgNoise: sql<number>`coalesce(avg(${reviews.noiseRating}), 0)`,
      avgSpace: sql<number>`coalesce(avg(${reviews.spaceRating}), 0)`,
      avgStaff: sql<number>`coalesce(avg(${reviews.staffRating}), 0)`,
      totalReviews: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.cafeId, cafeId), eq(reviews.isVisible, true)))

  const row = result[0]!
  return {
    avgOverall: Number(Number(row.avgOverall).toFixed(1)),
    avgWifi: Number(Number(row.avgWifi).toFixed(1)),
    avgNoise: Number(Number(row.avgNoise).toFixed(1)),
    avgSpace: Number(Number(row.avgSpace).toFixed(1)),
    avgStaff: Number(Number(row.avgStaff).toFixed(1)),
    totalReviews: Number(row.totalReviews),
  }
}
