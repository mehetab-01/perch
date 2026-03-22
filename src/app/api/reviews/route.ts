import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, reviews, cafes, users } from "@/lib/db/schema"
import { createReviewSchema } from "@/lib/validators/review"
import { createNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { reviewReceivedEmail } from "@/lib/emails/review-received"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Verify booking belongs to this worker and is completed
  const booking = await db
    .select({
      id: bookings.id,
      workerId: bookings.workerId,
      cafeId: bookings.cafeId,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, data.bookingId))
    .limit(1)

  if (!booking[0]) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking[0].workerId !== userId) {
    return NextResponse.json(
      { error: "You can only review your own bookings" },
      { status: 403 }
    )
  }

  if (booking[0].status !== "completed") {
    return NextResponse.json(
      { error: "You can only review completed bookings" },
      { status: 400 }
    )
  }

  // Check no review already exists (unique constraint also enforces this)
  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, data.bookingId))
    .limit(1)

  if (existing[0]) {
    return NextResponse.json(
      { error: "You have already reviewed this booking" },
      { status: 409 }
    )
  }

  const cafeId = booking[0].cafeId

  // Create review
  const [review] = await db
    .insert(reviews)
    .values({
      bookingId: data.bookingId,
      workerId: userId,
      cafeId,
      overallRating: data.overallRating,
      wifiRating: data.wifiRating ?? null,
      noiseRating: data.noiseRating ?? null,
      spaceRating: data.spaceRating ?? null,
      staffRating: data.staffRating ?? null,
      comment: data.comment ?? null,
    })
    .returning()

  // Recalculate cafe's avgRating and totalReviews
  const [stats] = await db
    .select({
      avg: sql<number>`avg(${reviews.overallRating})`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.cafeId, cafeId), eq(reviews.isVisible, true)))

  if (stats) {
    await db
      .update(cafes)
      .set({
        avgRating: Number(Number(stats.avg).toFixed(2)),
        totalReviews: Number(stats.count),
        reviewSummaryUpdatedAt: null, // invalidate AI summary cache
        updatedAt: new Date(),
      })
      .where(eq(cafes.id, cafeId))
  }

  // Notify cafe owner about the new review
  const [cafe] = await db
    .select({ ownerId: cafes.ownerId, name: cafes.name })
    .from(cafes)
    .where(eq(cafes.id, cafeId))
    .limit(1)

  const [workerUser] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (cafe?.ownerId) {
    const workerName = workerUser?.name ?? "A professional"

    await createNotification(
      cafe.ownerId,
      "review_received",
      `New ${data.overallRating}★ review`,
      `${workerName} left a review for ${cafe.name}.${data.comment ? ` "${data.comment.slice(0, 80)}${data.comment.length > 80 ? "..." : ""}"` : ""}`,
      { reviewId: review!.id, cafeId }
    )

    const [ownerUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, cafe.ownerId))
      .limit(1)

    if (ownerUser?.email) {
      const { subject, html } = reviewReceivedEmail({
        workerName,
        overallRating: data.overallRating,
        comment: data.comment,
      })
      await sendEmail(ownerUser.email, subject, html)
    }
  }

  return NextResponse.json({ review }, { status: 201 })
}
