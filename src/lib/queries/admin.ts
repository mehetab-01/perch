import { eq, desc, sql, gte, and, inArray, ilike, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, cafes, bookings, reviews, spaces } from "@/lib/db/schema"
import type {
  AdminStats,
  AdminActivityItem,
  AdminCafe,
  AdminUser,
  AdminBooking,
} from "@/types/admin"

function firstOfMonthISO(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const firstOfMonth = firstOfMonthISO()

  const [
    userCount,
    cafeBreakdown,
    bookingStats,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),

    db
      .select({
        status: cafes.verificationStatus,
        count: sql<number>`count(*)`,
      })
      .from(cafes)
      .groupBy(cafes.verificationStatus),

    db
      .select({
        count: sql<number>`count(*)`,
        gmv: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)`,
        revenue: sql<number>`coalesce(sum(${bookings.platformFee}), 0)`,
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.date, firstOfMonth),
          inArray(bookings.status, ["confirmed", "checked_in", "completed"])
        )
      ),
  ])

  const statusMap: Record<string, number> = {}
  for (const row of cafeBreakdown) {
    statusMap[row.status] = Number(row.count)
  }

  return {
    totalUsers: Number(userCount[0]?.count ?? 0),
    totalCafes:
      (statusMap["pending"] ?? 0) +
      (statusMap["verified"] ?? 0) +
      (statusMap["rejected"] ?? 0),
    cafesVerified: statusMap["verified"] ?? 0,
    cafesPending: statusMap["pending"] ?? 0,
    cafesRejected: statusMap["rejected"] ?? 0,
    bookingsThisMonth: Number(bookingStats[0]?.count ?? 0),
    gmvThisMonth: Number(bookingStats[0]?.gmv ?? 0),
    revenueThisMonth: Number(bookingStats[0]?.revenue ?? 0),
  }
}

export async function getAdminActivity(limit = 10): Promise<AdminActivityItem[]> {
  const items: AdminActivityItem[] = []

  const [recentUsers, recentCafes, recentBookings, recentReviews] =
    await Promise.all([
      db
        .select({ id: users.id, name: users.name, createdAt: users.createdAt })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5),

      db
        .select({ id: cafes.id, name: cafes.name, createdAt: cafes.createdAt })
        .from(cafes)
        .orderBy(desc(cafes.createdAt))
        .limit(5),

      db
        .select({
          id: bookings.id,
          cafeName: cafes.name,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
        .orderBy(desc(bookings.createdAt))
        .limit(5),

      db
        .select({
          id: reviews.id,
          cafeName: cafes.name,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .innerJoin(cafes, eq(reviews.cafeId, cafes.id))
        .orderBy(desc(reviews.createdAt))
        .limit(3),
    ])

  for (const u of recentUsers) {
    items.push({
      id: u.id,
      type: "user_signup",
      description: `${u.name} signed up`,
      timestamp: u.createdAt,
    })
  }
  for (const c of recentCafes) {
    items.push({
      id: c.id,
      type: "cafe_created",
      description: `${c.name} registered as a cafe`,
      timestamp: c.createdAt,
    })
  }
  for (const b of recentBookings) {
    items.push({
      id: b.id,
      type: "booking_made",
      description: `New booking at ${b.cafeName}`,
      timestamp: b.createdAt,
    })
  }
  for (const r of recentReviews) {
    items.push({
      id: r.id,
      type: "review_left",
      description: `Review left for ${r.cafeName}`,
      timestamp: r.createdAt,
    })
  }

  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

// ─── Cafes ───────────────────────────────────────────────────────────────────

export async function getAdminCafes(
  status?: "pending" | "verified" | "rejected"
): Promise<AdminCafe[]> {
  const conditions = status
    ? and(eq(cafes.verificationStatus, status))
    : undefined

  const result = await db
    .select({
      id: cafes.id,
      name: cafes.name,
      slug: cafes.slug,
      description: cafes.description,
      address: cafes.address,
      city: cafes.city,
      gstNumber: cafes.gstNumber,
      fssaiLicenseUrl: cafes.fssaiLicenseUrl,
      verificationStatus: cafes.verificationStatus,
      isActive: cafes.isActive,
      createdAt: cafes.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerId: users.id,
    })
    .from(cafes)
    .innerJoin(users, eq(cafes.ownerId, users.id))
    .where(conditions)
    .orderBy(desc(cafes.createdAt))

  // Get space counts in batch
  const cafeIds = result.map((r) => r.id)
  if (cafeIds.length === 0) return []

  const spaceCounts = await db
    .select({
      cafeId: spaces.cafeId,
      count: sql<number>`count(*)`,
    })
    .from(spaces)
    .where(inArray(spaces.cafeId, cafeIds))
    .groupBy(spaces.cafeId)

  const countMap = new Map(spaceCounts.map((s) => [s.cafeId, Number(s.count)]))

  return result.map((r) => ({
    ...r,
    spaceCount: countMap.get(r.id) ?? 0,
  }))
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAdminUsers(search?: string): Promise<AdminUser[]> {
  const conditions = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    : undefined

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions)
    .orderBy(desc(users.createdAt))
    .limit(100)

  // Batch fetch booking + cafe counts
  const userIds = result.map((r) => r.id)
  if (userIds.length === 0) return []

  const [bookingCounts, cafeCounts] = await Promise.all([
    db
      .select({
        workerId: bookings.workerId,
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .where(inArray(bookings.workerId, userIds))
      .groupBy(bookings.workerId),

    db
      .select({
        ownerId: cafes.ownerId,
        count: sql<number>`count(*)`,
      })
      .from(cafes)
      .where(inArray(cafes.ownerId, userIds))
      .groupBy(cafes.ownerId),
  ])

  const bookingMap = new Map(bookingCounts.map((b) => [b.workerId, Number(b.count)]))
  const cafeMap = new Map(cafeCounts.map((c) => [c.ownerId, Number(c.count)]))

  return result.map((r) => ({
    ...r,
    bookingCount: bookingMap.get(r.id) ?? 0,
    cafeCount: cafeMap.get(r.id) ?? 0,
  }))
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function getAdminBookings(
  status?: string,
  limit = 50
): Promise<AdminBooking[]> {
  const conditions = status
    ? eq(bookings.status, status as "pending" | "confirmed" | "checked_in" | "completed" | "cancelled")
    : undefined

  return db
    .select({
      id: bookings.id,
      workerName: users.name,
      cafeName: cafes.name,
      spaceName: spaces.name,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      totalAmount: bookings.totalAmount,
      platformFee: bookings.platformFee,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.workerId, users.id))
    .innerJoin(cafes, eq(bookings.cafeId, cafes.id))
    .innerJoin(spaces, eq(bookings.spaceId, spaces.id))
    .where(conditions)
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
}

/** Check if a user has the admin role in the DB */
export async function isAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user?.role === "admin"
}
