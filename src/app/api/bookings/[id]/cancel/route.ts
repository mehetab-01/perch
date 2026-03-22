import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and, gte, not, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, payments, cafes, spaces, users } from "@/lib/db/schema"
import { razorpay } from "@/lib/razorpay"
import { createNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { bookingCancelledEmail } from "@/lib/emails/booking-cancelled"
import { formatTime, formatDateLong } from "@/lib/utils/format"

// ── Refund policy ──
// >24h before booking: 100% refund
// 1-24h before booking: 50% refund
// <1h before booking: no refund

function calculateRefundPercentage(bookingDate: string, startTime: string): number {
  const bookingStart = new Date(`${bookingDate}T${startTime}:00`)
  const now = new Date()
  const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilBooking > 24) return 100
  if (hoursUntilBooking >= 1) return 50
  return 0
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
  }

  const body = await req.json()
  const rawReason = typeof body.reason === "string" ? body.reason.trim() : null
  const reason = rawReason ? rawReason.slice(0, 500) : null
  const cancelAll = body.cancelAll === true

  // Find the booking and verify ownership
  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      totalAmount: bookings.totalAmount,
      razorpayPaymentId: bookings.razorpayPaymentId,
      cafeId: bookings.cafeId,
      spaceId: bookings.spaceId,
      recurringGroupId: bookings.recurringGroupId,
      isRecurring: bookings.isRecurring,
    })
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.workerId, userId)))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return NextResponse.json(
      { error: "Only pending or confirmed bookings can be cancelled" },
      { status: 400 }
    )
  }

  // ── Process refund if payment was captured ──

  let refundAmount = 0
  let refundPercentage = 0

  if (booking.status === "confirmed" && booking.razorpayPaymentId) {
    refundPercentage = calculateRefundPercentage(booking.date, booking.startTime)

    if (refundPercentage > 0) {
      refundAmount = Math.round(booking.totalAmount * (refundPercentage / 100))

      try {
        await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: refundAmount,
          notes: {
            bookingId: booking.id,
            reason: reason || "User cancelled",
            refundPercentage: String(refundPercentage),
          },
        })

        // Update payment record
        await db
          .update(payments)
          .set({ paymentStatus: "refunded" })
          .where(eq(payments.razorpayPaymentId, booking.razorpayPaymentId))
      } catch (error) {
        console.error("Razorpay refund failed:", error)
        return NextResponse.json(
          { error: "Refund processing failed. Please try again or contact support." },
          { status: 502 }
        )
      }
    }
  }

  // ── Cancel the booking ──

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason || null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))

  // ── Cancel all remaining sessions in the recurring series ──

  let cancelledSeriesCount = 0

  if (cancelAll && booking.isRecurring && booking.recurringGroupId) {
    const today = new Date().toISOString().split("T")[0]!

    // Find all future, cancellable bookings in the same series (excluding the one just cancelled)
    const seriesBookings = await db
      .select({
        id: bookings.id,
        date: bookings.date,
        startTime: bookings.startTime,
        totalAmount: bookings.totalAmount,
        razorpayPaymentId: bookings.razorpayPaymentId,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.recurringGroupId, booking.recurringGroupId),
          eq(bookings.workerId, userId),
          not(eq(bookings.id, id)),
          gte(bookings.date, today),
          not(inArray(bookings.status, ["cancelled", "completed", "checked_in"]))
        )
      )

    for (const seriesBooking of seriesBookings) {
      // Process per-session refund
      if (seriesBooking.status === "confirmed" && seriesBooking.razorpayPaymentId) {
        const pct = calculateRefundPercentage(seriesBooking.date, seriesBooking.startTime)
        if (pct > 0) {
          const refund = Math.round(seriesBooking.totalAmount * (pct / 100))
          try {
            await razorpay.payments.refund(seriesBooking.razorpayPaymentId, {
              amount: refund,
              notes: {
                bookingId: seriesBooking.id,
                reason: reason || "Series cancellation",
                refundPercentage: String(pct),
              },
            })
            await db
              .update(payments)
              .set({ paymentStatus: "refunded" })
              .where(eq(payments.razorpayPaymentId, seriesBooking.razorpayPaymentId))
          } catch (err) {
            console.error(`Refund failed for series booking ${seriesBooking.id}:`, err)
          }
        }
      }

      await db
        .update(bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: reason || "Series cancelled",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, seriesBooking.id))

      cancelledSeriesCount++
    }
  }

  // ── Notify cafe owner ──

  const [cafe, space] = await Promise.all([
    db.select({ name: cafes.name, ownerId: cafes.ownerId, address: cafes.address }).from(cafes).where(eq(cafes.id, booking.cafeId)).limit(1),
    db.select({ name: spaces.name }).from(spaces).where(eq(spaces.id, booking.spaceId)).limit(1),
  ])

  const cafeName = cafe[0]?.name ?? "the cafe"
  const cafeOwnerId = cafe[0]?.ownerId
  const spaceName = space[0]?.name ?? "a space"
  const dateFormatted = formatDateLong(booking.date)
  const startFormatted = formatTime(booking.startTime)
  const endFormatted = formatTime(booking.endTime)

  if (cafeOwnerId) {
    const [ownerUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, cafeOwnerId)).limit(1)

    await createNotification(
      cafeOwnerId,
      "booking_cancelled",
      "Booking cancelled",
      `A booking at ${cafeName} on ${dateFormatted} was cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      { bookingId: booking.id }
    )

    if (ownerUser?.email) {
      const { subject, html } = bookingCancelledEmail({
        cafeName,
        spaceName,
        date: dateFormatted,
        startTime: startFormatted,
        endTime: endFormatted,
        reason,
        recipientRole: "cafe",
      })
      await sendEmail(ownerUser.email, subject, html)
    }
  }

  return NextResponse.json({
    success: true,
    refundPercentage,
    refundAmount,
    ...(cancelledSeriesCount > 0 ? { cancelledSeriesCount } : {}),
  })
}
