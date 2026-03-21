import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, payments } from "@/lib/db/schema"
import { razorpay } from "@/lib/razorpay"

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

  // Find the booking and verify ownership
  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      date: bookings.date,
      startTime: bookings.startTime,
      totalAmount: bookings.totalAmount,
      razorpayPaymentId: bookings.razorpayPaymentId,
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

  return NextResponse.json({
    success: true,
    refundPercentage,
    refundAmount,
  })
}
