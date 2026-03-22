import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, payments, cafes, spaces, users } from "@/lib/db/schema"
import { verifyWebhookSignature } from "@/lib/razorpay"
import { createNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { bookingConfirmedEmail } from "@/lib/emails/booking-confirmed"
import { newBookingCafeEmail } from "@/lib/emails/new-booking-cafe"
import { formatTime, formatDateLong } from "@/lib/utils/format"
import { generateGoogleCalendarUrl } from "@/lib/calendar"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature")

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body) as {
    event: string
    payload: {
      payment?: { entity: { id: string; order_id: string; status: string } }
      refund?: { entity: { id: string; payment_id: string; status: string } }
    }
  }

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity
      if (!payment) break

      // Update payment record
      await db
        .update(payments)
        .set({
          razorpayPaymentId: payment.id,
          paymentStatus: "captured",
        })
        .where(eq(payments.razorpayOrderId, payment.order_id))

      // Update booking status to confirmed
      const [confirmedBooking] = await db
        .update(bookings)
        .set({
          status: "confirmed",
          razorpayPaymentId: payment.id,
          updatedAt: new Date(),
        })
        .where(eq(bookings.razorpayOrderId, payment.order_id))
        .returning({
          id: bookings.id,
          workerId: bookings.workerId,
          cafeId: bookings.cafeId,
          spaceId: bookings.spaceId,
          date: bookings.date,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          numAttendees: bookings.numAttendees,
        })

      // Send notifications + emails (fire-and-forget, don't block webhook response)
      if (confirmedBooking) {
        const [cafe, space, worker] = await Promise.all([
          db.select({ name: cafes.name, ownerId: cafes.ownerId, address: cafes.address }).from(cafes).where(eq(cafes.id, confirmedBooking.cafeId)).limit(1),
          db.select({ name: spaces.name }).from(spaces).where(eq(spaces.id, confirmedBooking.spaceId)).limit(1),
          db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, confirmedBooking.workerId)).limit(1),
        ])

        const cafeName = cafe[0]?.name ?? "the cafe"
        const cafeOwnerId = cafe[0]?.ownerId
        const cafeAddress = cafe[0]?.address ?? ""
        const spaceName = space[0]?.name ?? "a space"
        const workerName = worker[0]?.name ?? "A professional"
        const workerEmail = worker[0]?.email
        const dateFormatted = formatDateLong(confirmedBooking.date)
        const startFormatted = formatTime(confirmedBooking.startTime)
        const endFormatted = formatTime(confirmedBooking.endTime)

        // Notify worker: booking confirmed
        await createNotification(
          confirmedBooking.workerId,
          "booking_confirmed",
          "Booking confirmed!",
          `Your meeting at ${cafeName} on ${dateFormatted} is confirmed.`,
          { bookingId: confirmedBooking.id, cafeId: confirmedBooking.cafeId }
        )

        if (workerEmail) {
          const googleCalendarUrl = generateGoogleCalendarUrl({
            id: confirmedBooking.id,
            date: confirmedBooking.date,
            startTime: confirmedBooking.startTime,
            endTime: confirmedBooking.endTime,
            cafeName,
            cafeAddress,
            spaceName,
            numAttendees: confirmedBooking.numAttendees,
            meetingTitle: null,
            agenda: null,
          })

          const { subject, html } = bookingConfirmedEmail({
            cafeName,
            spaceName,
            date: dateFormatted,
            startTime: startFormatted,
            endTime: endFormatted,
            address: cafeAddress,
            bookingId: confirmedBooking.id,
            googleCalendarUrl,
          })
          await sendEmail(workerEmail, subject, html)
        }

        // Notify cafe owner: new booking
        if (cafeOwnerId) {
          const [ownerUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, cafeOwnerId)).limit(1)

          await createNotification(
            cafeOwnerId,
            "new_booking",
            "New booking received!",
            `${workerName} booked ${spaceName} on ${dateFormatted}.`,
            { bookingId: confirmedBooking.id }
          )

          if (ownerUser?.email) {
            const { subject, html } = newBookingCafeEmail({
              workerName,
              spaceName,
              date: dateFormatted,
              startTime: startFormatted,
              endTime: endFormatted,
              attendees: confirmedBooking.numAttendees,
            })
            await sendEmail(ownerUser.email, subject, html)
          }
        }
      }

      break
    }

    case "payment.failed": {
      const payment = event.payload.payment?.entity
      if (!payment) break

      // Update payment record
      await db
        .update(payments)
        .set({
          razorpayPaymentId: payment.id,
          paymentStatus: "failed",
        })
        .where(eq(payments.razorpayOrderId, payment.order_id))

      // Cancel the booking
      await db
        .update(bookings)
        .set({
          status: "cancelled",
          cancelReason: "Payment failed",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(bookings.razorpayOrderId, payment.order_id))

      break
    }

    case "refund.processed": {
      const refund = event.payload.refund?.entity
      if (!refund) break

      // Update payment status to refunded
      await db
        .update(payments)
        .set({ paymentStatus: "refunded" })
        .where(eq(payments.razorpayPaymentId, refund.payment_id))

      break
    }

    default:
      // Acknowledge unhandled events without error
      break
  }

  return NextResponse.json({ status: "ok" })
}
