import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, cafes, payments } from "@/lib/db/schema"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Get booking
  const booking = await db
    .select({
      id: bookings.id,
      cafeId: bookings.cafeId,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking[0]) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify cafe owner owns this booking's cafe
  const cafe = await db
    .select({ id: cafes.id })
    .from(cafes)
    .where(and(eq(cafes.id, booking[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json(
      { error: "Not authorized for this booking" },
      { status: 403 }
    )
  }

  // Must be checked_in
  if (booking[0].status !== "checked_in") {
    return NextResponse.json(
      { error: "Booking must be checked in before completing" },
      { status: 400 }
    )
  }

  // Update booking status
  await db
    .update(bookings)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(bookings.id, id))

  // Mark payment payout as ready (settled handled by separate process)
  await db
    .update(payments)
    .set({ payoutStatus: "pending" })
    .where(
      and(
        eq(payments.bookingId, id),
        eq(payments.paymentStatus, "captured")
      )
    )

  return NextResponse.json({ success: true })
}
