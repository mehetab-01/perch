import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, payments } from "@/lib/db/schema"
import { verifyWebhookSignature } from "@/lib/razorpay"

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
      await db
        .update(bookings)
        .set({
          status: "confirmed",
          razorpayPaymentId: payment.id,
          updatedAt: new Date(),
        })
        .where(eq(bookings.razorpayOrderId, payment.order_id))

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
