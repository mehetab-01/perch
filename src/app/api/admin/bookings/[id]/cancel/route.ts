import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, payments, cafes, spaces } from "@/lib/db/schema"
import { isAdmin } from "@/lib/queries/admin"
import { razorpay } from "@/lib/razorpay"
import { createNotification } from "@/lib/notifications"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasAccess = await isAdmin(userId)
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
  }

  const body = await req.json()
  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "Cancelled by admin"

  // Fetch the booking
  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      totalAmount: bookings.totalAmount,
      razorpayPaymentId: bookings.razorpayPaymentId,
      workerId: bookings.workerId,
      cafeId: bookings.cafeId,
      spaceId: bookings.spaceId,
    })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    return NextResponse.json(
      { error: `Cannot cancel a ${booking.status} booking` },
      { status: 400 }
    )
  }

  // Full refund for admin-initiated cancellations
  let refundAmount = 0

  if (booking.razorpayPaymentId && booking.status === "confirmed") {
    refundAmount = booking.totalAmount
    try {
      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: refundAmount,
        notes: {
          bookingId: booking.id,
          reason,
          cancelledBy: "admin",
        },
      })

      await db
        .update(payments)
        .set({ paymentStatus: "refunded" })
        .where(eq(payments.razorpayPaymentId, booking.razorpayPaymentId))
    } catch (error) {
      console.error("Admin refund failed:", error)
      return NextResponse.json(
        { error: "Refund processing failed" },
        { status: 502 }
      )
    }
  }

  // Cancel the booking
  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))

  // Fetch names for notifications
  const [cafe, space] = await Promise.all([
    db.select({ name: cafes.name, ownerId: cafes.ownerId }).from(cafes).where(eq(cafes.id, booking.cafeId)).limit(1),
    db.select({ name: spaces.name }).from(spaces).where(eq(spaces.id, booking.spaceId)).limit(1),
  ])

  const cafeName = cafe[0]?.name ?? "the cafe"
  const spaceName = space[0]?.name ?? "a space"

  // Notify the worker
  await createNotification(
    booking.workerId,
    "booking_cancelled",
    "Booking cancelled by admin",
    `Your booking for ${spaceName} at ${cafeName} has been cancelled by an administrator. Reason: ${reason}`,
    { bookingId: booking.id }
  )

  // Notify the cafe owner
  if (cafe[0]?.ownerId) {
    await createNotification(
      cafe[0].ownerId,
      "booking_cancelled",
      "Booking cancelled by admin",
      `A booking for ${spaceName} at ${cafeName} has been cancelled by an administrator.`,
      { bookingId: booking.id }
    )
  }

  return NextResponse.json({ success: true, refundAmount })
}
